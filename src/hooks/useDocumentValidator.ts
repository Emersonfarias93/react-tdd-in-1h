import { useState, useCallback } from 'react';
import { validateDocument, removeNonNumeric } from '../utils/validators';

export interface DocumentValidation {
    value: string;
    isValid: boolean;
    type: 'CPF' | 'CNPJ' | 'UNKNOWN';
    formatted: string;
    error?: string;
}

export const useDocumentValidator = (initialValue = '') => {
    const [document, setDocument] = useState<DocumentValidation>(() => {
        const validation = validateDocument(initialValue);
        return {
            value: initialValue,
            ...validation,
            error: validation.isValid ? undefined : 'Documento inválido'
        };
    });

    const updateDocument = useCallback((value: string) => {
        const numbers = removeNonNumeric(value);

        if (numbers.length > 14) return;

        const validation = validateDocument(value);

        let error: string | undefined;
        if (value && !validation.isValid) {
            if (validation.type === 'UNKNOWN') {
                error = 'Digite um CPF (11 dígitos) ou CNPJ (14 dígitos)';
            } else {
                error = `${validation.type} inválido`;
            }
        }

        setDocument({
            value,
            ...validation,
            error
        });
    }, []);

    const clear = useCallback(() => {
        setDocument({
            value: '',
            isValid: false,
            type: 'UNKNOWN',
            formatted: '',
            error: undefined
        });
    }, []);

    return {
        document,
        updateDocument,
        clear,
        isValid: document.isValid,
        hasError: !!document.error
    };
};
