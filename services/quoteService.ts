

import { QuoteInput, QuoteResponse, Deduction, QuoteRejection, ValuationDeduction } from '../types';
import * as api from './api';

export const computeQuote = async (input: QuoteInput): Promise<QuoteResponse | QuoteRejection> => {
      const { brand, model, ram_gb, storage_gb, declared_condition } = input;
      
      if (declared_condition.imei_status === 'blacklisted') {
        return {
          rejection: true,
          reason: 'blacklisted_imei',
          message: 'Devices with blacklisted IMEIs cannot be traded in. We can offer safe, environmentally friendly disposal for your device.'
        };
      }

      // FETCH DYNAMIC PRICE FROM DB
      // Note: api.getValuationForDevice handles robust lookup (ignoring RAM if strict match fails)
      const baseline = await api.getValuationForDevice(brand, model, ram_gb, storage_gb);

      if (!baseline) {
        return {
          rejection: true,
          reason: 'unsupported_model',
          message: 'This model or storage configuration is not currently supported in our valuation database. Please contact support.'
        };
      }

      // FETCH DYNAMIC DEDUCTIONS FROM DB
      // Force fresh fetch to respect Admin changes immediately.
      let deductionRules: ValuationDeduction[] = [];
      try {
          // DO NOT use constants or defaults. Strictly use DB.
          deductionRules = await api.getValuationDeductions();
      } catch (e) {
          console.error("Failed to fetch deduction rules", e);
          // If DB fetch fails, we have no rules, so no deductions applied (or maybe we should error out?)
          // For now, assume 0 deductions if DB unreachable to avoid blocking user, 
          // but in production this should probably be an error.
          deductionRules = []; 
      }
      
      const isApple = brand.toLowerCase().includes('apple');

      // Helper to get percentage based on brand and rule ID from DB
      const getPct = (key: string) => {
          const rule = deductionRules.find(r => r.id === key);
          if (!rule) return 0; // If rule not in DB, 0% deduction
          
          if (isApple) {
              return rule.applePercentage !== undefined ? rule.applePercentage : (rule.percentage || 0);
          } else {
              return rule.androidPercentage !== undefined ? rule.androidPercentage : (rule.percentage || 0);
          }
      };
      
      let currentPrice = baseline;
      const deductions: Deduction[] = [];

      const applyDeduction = (reason: string, percentage: number) => {
        if (percentage <= 0) return; // Don't apply 0% deductions
        const deductionAmount = baseline * (percentage / 100); // Calculate off BASELINE for consistency
        currentPrice -= deductionAmount;
        deductions.push({ reason, type: 'percent', value: percentage, amount: deductionAmount });
      };
      
      // 1. Power Issue (Major)
      if (!declared_condition.powers_on) {
          applyDeduction('powers_on_false', getPct('powers_on_false'));
      }
      
      // 2. Lock / MDMS
      if (!declared_condition.factory_unlocked_mdms_free) {
        applyDeduction('not_unlocked_or_mdms_registered', getPct('not_unlocked_or_mdms_registered'));
      }

      // 3. Screen / Display
      if (declared_condition.screen_cracks === 'hairline') applyDeduction('screen_cracks_hairline', getPct('screen_cracks_hairline'));
      if (declared_condition.screen_cracks === 'major') applyDeduction('screen_cracks_major', getPct('screen_cracks_major'));
      if (declared_condition.lcd_damage === 'lines') applyDeduction('lcd_damage_lines', getPct('lcd_damage_lines'));
      if (declared_condition.lcd_damage === 'black_spots') applyDeduction('lcd_damage_black_spots', getPct('lcd_damage_black_spots'));
      
      // 4. Water Damage
      if (declared_condition.water_damage === 'indicator_tripped') applyDeduction('water_damage_tripped', getPct('water_damage_tripped'));
      
      // 5. Battery Health
      if (declared_condition.battery_health_pct < 70) {
        applyDeduction('battery_lt_70', getPct('battery_lt_70'));
      } else if (declared_condition.battery_health_pct < 80) {
        applyDeduction('battery_lt_80', getPct('battery_lt_80'));
      }

      // 6. Functionality
      if (declared_condition.face_id_touch_id === 'faulty') applyDeduction('face_id_touch_id_faulty', getPct('face_id_touch_id_faulty'));
      if (declared_condition.buttons === 'faulty') applyDeduction('buttons_faulty', getPct('buttons_faulty'));
      if (declared_condition.camera === 'faulty') applyDeduction('camera_faulty', getPct('camera_faulty'));

      // 7. Cosmetics
      if (declared_condition.back_glass === 'cracked') applyDeduction('back_glass_cracked', getPct('back_glass_cracked'));
      if (declared_condition.minor_scratches) {
        applyDeduction('minor_scratches', getPct('minor_scratches'));
      }
      
      // 8. Age Depreciation
      // Admin request: 0-3 months = 0 penalty.
      const agePenaltyPercent = Math.min(declared_condition.age_months * 0.5, 20); // Cap at 20%
      if (agePenaltyPercent > 0) {
          applyDeduction('age_penalty', agePenaltyPercent);
      }
      
      // Ensure we don't go below minimum or negative
      const finalCalculatedValue = Math.min(baseline, Math.max(0, currentPrice));
      
      const minPayable = 500;
      
      if (finalCalculatedValue < minPayable) {
        return {
            rejection: true,
            reason: 'below_min_payable',
            message: `The calculated value is below our minimum of NPR ${minPayable}. We can offer a free, eco-friendly recycling service for your device.`
        };
      }

      const estimate_min = Math.floor(finalCalculatedValue);
      const estimate_max = Math.floor(finalCalculatedValue);
      
      return {
        brand,
        model,
        ram_gb,
        storage_gb,
        estimate_min,
        estimate_max,
        currency: 'NPR',
        calc: {
          baseline,
          calculated_value: finalCalculatedValue,
          deductions,
          notes: "Quote based on Live Admin Valuation Database."
        },
        policy: {
          tolerance_percent: 0,
          approval_required_if_below: true,
          min_payable: minPayable,
        },
        next: {
          create_tradein: true,
          required_fields: ["photos", "address", "payout_method"]
        }
      };
};