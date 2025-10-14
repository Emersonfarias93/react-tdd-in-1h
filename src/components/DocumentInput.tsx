import React from 'react';
import { useDocumentValidator } from '../hooks/useDocumentValidator';

interface DocumentInputProps {
    label?: string;
    placeholder?: string;
    onValidationChange?: (isValid: boolean, type: 'CPF' | 'CNPJ' | 'UNKNOWN') => void;
    className?: string;
}

export const DocumentInput: React.FC<DocumentInputProps> = ({
                                                                label = 'CPF/CNPJ',
                                                                placeholder = 'Digite seu CPF ou CNPJ',
                                                                onValidationChange,
                                                                className = ''
                                                            }) => {
    const { document, updateDocument, clear, isValid, hasError } = useDocumentValidator();

    const inputId = React.useId();

    React.useEffect(() => {
        onValidationChange?.(isValid, document.type);
    }, [isValid, document.type, onValidationChange]);

    const getInputClassName = () => {
        let baseClass = 'input-field ';

        if (hasError) {
            baseClass += 'invalid ';
        } else if (isValid) {
            baseClass += 'valid ';
        }

        return baseClass + className;
    };

    return (
        <div className="input-section">
            <label htmlFor={inputId}>{label}</label>

            <div className="input-group">
                <input
                    id={inputId}
                    type="text"
                    value={document.formatted}
                    onChange={(e) => updateDocument(e.target.value)}
                    placeholder={placeholder}
                    className={getInputClassName()}
                    data-testid="document-input"
                />

                {document.value && (
                    <button
                        type="button"
                        onClick={clear}
                        className="clear-button"
                        data-testid="clear-button"
                        aria-label="Limpar campo"
                        title="Limpar campo"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="feedback-container">
                {hasError && (
                    <p className="validation-feedback invalid" data-testid="error-message">
                        {document.error} <span className="icon">⚠</span>
                    </p>
                )}

                {isValid && (
                    <p className="validation-feedback valid" data-testid="success-message">
                        {document.type} válido <span className="icon">✓</span>
                    </p>
                )}

                {document.value && document.type !== 'UNKNOWN' && (
                    <p className="document-type" data-testid="document-type">
                        <strong>Tipo:</strong> {document.type}
                    </p>
                )}
            </div>
        </div>
    );
};
