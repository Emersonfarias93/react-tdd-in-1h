import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDocumentValidator } from '../../src/hooks/useDocumentValidator';

describe('useDocumentValidator', () => {
    it('should initialize with empty state', () => {
        const { result } = renderHook(() => useDocumentValidator());

        expect(result.current.document.isValid).toBe(false);
        expect(result.current.document.type).toBe('UNKNOWN');
        expect(result.current.isValid).toBe(false);
    });

    it('should initialize with provided value', () => {
        const { result } = renderHook(() => useDocumentValidator('12345678909'));

        expect(result.current.document.value).toBe('12345678909');
        expect(result.current.document.isValid).toBe(true);
        expect(result.current.document.type).toBe('CPF');
    });

    it('should update document and validate CPF', () => {
        const { result } = renderHook(() => useDocumentValidator());

        act(() => {
            result.current.updateDocument('12345678909');
        });

        expect(result.current.document.value).toBe('12345678909');
        expect(result.current.document.isValid).toBe(true);
        expect(result.current.document.type).toBe('CPF');
        expect(result.current.document.formatted).toBe('123.456.789-09');
        expect(result.current.hasError).toBe(false);
    });

    it('should show error for invalid CPF', () => {
        const { result } = renderHook(() => useDocumentValidator());

        act(() => {
            result.current.updateDocument('12345678901');
        });

        expect(result.current.document.isValid).toBe(false);
        expect(result.current.document.error).toBe('CPF inválido');
        expect(result.current.hasError).toBe(true);
    });

    it('should validate CNPJ', () => {
        const { result } = renderHook(() => useDocumentValidator());

        act(() => {
            result.current.updateDocument('11222333000181');
        });

        expect(result.current.document.isValid).toBe(true);
        expect(result.current.document.type).toBe('CNPJ');
        expect(result.current.document.formatted).toBe('11.222.333/0001-81');
    });

    it('should limit input to 14 digits', () => {
        const { result } = renderHook(() => useDocumentValidator());

        act(() => {
            result.current.updateDocument('123456789012345');
        });

        expect(result.current.document.value).toBe('');
    });

    it('should clear document', () => {
        const { result } = renderHook(() => useDocumentValidator('12345678909'));

        act(() => {
            result.current.clear();
        });

        expect(result.current.document.value).toBe('');
        expect(result.current.document.isValid).toBe(false);
        expect(result.current.document.error).toBe(undefined);
    });
});
