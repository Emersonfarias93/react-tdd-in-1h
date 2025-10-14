import { describe, it, expect } from 'vitest';
import {
    removeNonNumeric,
    formatCPF,
    formatCNPJ,
    validateCPF,
    validateCNPJ,
    validateDocument
} from '../../src/utils/validators';

describe('Validators Utils', () => {
    describe('removeNonNumeric', () => {
        it('should remove all non-numeric characters', () => {
            expect(removeNonNumeric('123.456.789-09')).toBe('12345678909');
            expect(removeNonNumeric('11.222.333/0001-81')).toBe('11222333000181');
            expect(removeNonNumeric('abc123def456')).toBe('123456');
        });
    });

    describe('formatCPF', () => {
        it('should format CPF correctly', () => {
            expect(formatCPF('12345678909')).toBe('123.456.789-09');
            expect(formatCPF('123456789')).toBe('123.456.789');
            expect(formatCPF('12345')).toBe('123.45');
        });

        it('should handle partial input', () => {
            expect(formatCPF('123')).toBe('123');
            expect(formatCPF('1234')).toBe('123.4');
        });
    });

    describe('formatCNPJ', () => {
        it('should format CNPJ correctly', () => {
            expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
            expect(formatCNPJ('112223330001')).toBe('11.222.333/0001');
        });

        it('should handle partial input', () => {
            expect(formatCNPJ('11')).toBe('11');
            expect(formatCNPJ('112')).toBe('11.2');
        });
    });

    describe('validateCPF', () => {
        it('should validate correct CPFs', () => {
            expect(validateCPF('12345678909')).toBe(true);
            expect(validateCPF('123.456.789-09')).toBe(true);
            expect(validateCPF('11144477735')).toBe(true);
        });

        it('should reject invalid CPFs', () => {
            expect(validateCPF('12345678901')).toBe(false);
            expect(validateCPF('11111111111')).toBe(false);
            expect(validateCPF('123456789')).toBe(false);
            expect(validateCPF('1234567890123')).toBe(false);
        });

        it('should reject CPFs with all same digits', () => {
            expect(validateCPF('00000000000')).toBe(false);
            expect(validateCPF('11111111111')).toBe(false);
            expect(validateCPF('99999999999')).toBe(false);
        });
    });

    describe('validateCNPJ', () => {
        it('should validate correct CNPJs', () => {
            expect(validateCNPJ('11222333000181')).toBe(true);
            expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
        });

        it('should reject invalid CNPJs', () => {
            expect(validateCNPJ('11222333000180')).toBe(false);
            expect(validateCNPJ('11111111111111')).toBe(false);
            expect(validateCNPJ('1122233300018')).toBe(false);
            expect(validateCNPJ('112223330001811')).toBe(false);
        });

        it('should reject CNPJs with all same digits', () => {
            expect(validateCNPJ('00000000000000')).toBe(false);
            expect(validateCNPJ('11111111111111')).toBe(false);
        });
    });

    describe('validateDocument', () => {
        it('should detect and validate CPF', () => {
            const result = validateDocument('12345678909');
            expect(result.type).toBe('CPF');
            expect(result.isValid).toBe(true);
            expect(result.formatted).toBe('123.456.789-09');
        });

        it('should detect and validate CNPJ', () => {
            const result = validateDocument('11222333000181');
            expect(result.type).toBe('CNPJ');
            expect(result.isValid).toBe(true);
            expect(result.formatted).toBe('11.222.333/0001-81');
        });

        it('should return UNKNOWN for invalid length', () => {
            const result = validateDocument('123456');
            expect(result.type).toBe('UNKNOWN');
            expect(result.isValid).toBe(false);
        });
    });
});
