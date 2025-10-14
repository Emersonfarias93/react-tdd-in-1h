import { describe, it, expect, vi, beforeEach } from 'vitest';
import {render, screen, cleanup, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentInput } from '../../src/components/DocumentInput';
import { useDocumentValidator } from '../../src/hooks/useDocumentValidator';

let mockIdCounter = 0;
vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
        ...actual,
        useId: () => `test-id-${++mockIdCounter}`,
    };
});

const mockClear = vi.fn();
const mockUseDocumentValidator = vi.mocked(useDocumentValidator);
const mockUpdateDocument = vi.fn();

vi.mock('../../src/hooks/useDocumentValidator', () => ({
    useDocumentValidator: vi.fn(() => ({
        document: {
            value: '',
            formatted: '',
            isValid: false,
            type: 'UNKNOWN',
            error: undefined,
        },
        updateDocument: mockUpdateDocument,
        clear: mockClear,
        isValid: false,
        hasError: false,
    })),
}));

describe('DocumentInput', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        cleanup();
        mockIdCounter = 0;

        mockUseDocumentValidator.mockReturnValue({
            document: {
                value: '',
                formatted: '',
                isValid: false,
                type: 'UNKNOWN',
                error: undefined,
            },
            updateDocument: mockUpdateDocument,
            clear: mockClear,
            isValid: false,
            hasError: false,
        });
    });

    describe('Renderização com props padrão', () => {
        it('should render with default props', () => {
            render(<DocumentInput />);

            expect(screen.getByText('CPF/CNPJ')).toBeTruthy();
            expect(screen.getByPlaceholderText('Digite seu CPF ou CNPJ')).toBeTruthy();
            expect(screen.getByTestId('document-input')).toBeTruthy();

            const input = screen.getByTestId('document-input');
            expect(input.getAttribute('type')).toBe('text');
            expect(input.getAttribute('value')).toBe('');
            expect(input.getAttribute('placeholder')).toBe('Digite seu CPF ou CNPJ');
        });

        it('should render with custom props', () => {
            render(
                <DocumentInput
                    label="Documento"
                    placeholder="Insira o documento"
                    className="custom-class"
                />
            );

            expect(screen.getByText('Documento')).toBeTruthy();
            expect(screen.getByPlaceholderText('Insira o documento')).toBeTruthy();

            const input = screen.getByTestId('document-input');
            expect(input.className).toContain('custom-class');
        });

        it('should generate unique input id and associate with label', () => {
            const { container } = render(<DocumentInput />);

            const label = container.querySelector('label');
            const input = container.querySelector('input');

            expect(label).toBeTruthy();
            expect(input).toBeTruthy();

            const labelFor = label?.getAttribute('for');
            const inputId = input?.getAttribute('id');

            expect(labelFor).toBeTruthy();
            expect(inputId).toBeTruthy();
            expect(labelFor).toBe(inputId);

            expect(inputId).toMatch(':r2:');
        });

        it('should have unique ids for multiple instances', () => {
            const { container: container1 } = render(<DocumentInput />);
            const { container: container2 } = render(<DocumentInput />);

            const input1 = container1.querySelector('input');
            const input2 = container2.querySelector('input');

            const id1 = input1?.getAttribute('id');
            const id2 = input2?.getAttribute('id');

            expect(id1).toBeTruthy();
            expect(id2).toBeTruthy();
            expect(id1).not.toBe(id2);
        });
    });

    describe('Estados do componente', () => {
        it('should render initial state correctly', () => {
            render(<DocumentInput />);

            const input = screen.getByTestId('document-input');

            expect(input.className).toContain('input-field');
            expect(screen.queryByTestId('clear-button')).toBeNull();

            expect(screen.queryByTestId('error-message')).toBeNull();
            expect(screen.queryByTestId('success-message')).toBeNull();
            expect(screen.queryByTestId('document-type')).toBeNull();
        });

        it('should render valid state', () => {
            mockUseDocumentValidator.mockReturnValue({
                document: {
                    value: '12345678909',
                    formatted: '123.456.789-09',
                    isValid: true,
                    type: 'CPF',
                    error: undefined,
                },
                updateDocument: mockUpdateDocument,
                clear: mockClear,
                isValid: true,
                hasError: false,
            });

            render(<DocumentInput />);

            const input = screen.getByTestId('document-input');

            expect(input.className).toContain('valid');
            expect(input.getAttribute('value')).toBe('123.456.789-09');

            expect(screen.getByTestId('clear-button')).toBeTruthy();

            expect(screen.getByTestId('success-message')).toBeTruthy();
            expect(screen.getByTestId('success-message').textContent).toContain('CPF válido ✓');

            expect(screen.getByTestId('document-type')).toBeTruthy();
            expect(screen.getByTestId('document-type').textContent).toContain('Tipo: CPF');
        });

        it('should render invalid state', () => {
            mockUseDocumentValidator.mockReturnValue({
                document: {
                    value: '12345678901',
                    formatted: '123.456.789-01',
                    isValid: false,
                    type: 'CPF',
                    error: 'CPF inválido',
                },
                updateDocument: mockUpdateDocument,
                clear: mockClear,
                isValid: false,
                hasError: true,
            });

            render(<DocumentInput />);

            const input = screen.getByTestId('document-input');

            expect(input.className).toContain('invalid');
            expect(input.getAttribute('value')).toBe('123.456.789-01');

            expect(screen.getByTestId('clear-button')).toBeTruthy();

            expect(screen.getByTestId('error-message')).toBeTruthy();
            expect(screen.getByTestId('error-message').textContent).toContain('CPF inválido ⚠');

            expect(screen.getByTestId('document-type')).toBeTruthy();
            expect(screen.getByTestId('document-type').textContent).toContain('Tipo: CPF');
        });

        it('should render CNPJ valid state', () => {
            mockUseDocumentValidator.mockReturnValue({
                document: {
                    value: '11222333000181',
                    formatted: '11.222.333/0001-81',
                    isValid: true,
                    type: 'CNPJ',
                    error: undefined,
                },
                updateDocument: mockUpdateDocument,
                clear: mockClear,
                isValid: true,
                hasError: false,
            });

            render(<DocumentInput />);

            expect(screen.getByTestId('success-message').textContent).toContain('CNPJ válido ✓');
            expect(screen.getByTestId('document-type').textContent).toContain('Tipo: CNPJ');
        });

        it('should not render document type for UNKNOWN type', () => {
            mockUseDocumentValidator.mockReturnValue({
                document: {
                    value: '123',
                    formatted: '123',
                    isValid: false,
                    type: 'UNKNOWN',
                    error: 'Digite um CPF (11 dígitos) ou CNPJ (14 dígitos)',
                },
                updateDocument: mockUpdateDocument,
                clear: mockClear,
                isValid: false,
                hasError: true,
            });

            render(<DocumentInput />);

            expect(screen.queryByTestId('document-type')).toBeNull();

            expect(screen.getByTestId('error-message')).toBeTruthy();
        });
    });

    describe('Interações do usuário', () => {
        beforeEach(() => {
            mockUpdateDocument.mockClear();
            mockClear.mockClear();
        });

        it('should call updateDocument when input changes', () => {
            render(<DocumentInput />);
            const input = screen.getByTestId('document-input');
            fireEvent.change(input, { target: { value: '123' } });
            expect(mockUpdateDocument).toHaveBeenCalledWith('123');
            expect(mockUpdateDocument).toHaveBeenCalledTimes(1);
        });

        it('should call updateDocument multiple times for different values', () => {
            render(<DocumentInput />);
            const input = screen.getByTestId('document-input');

            fireEvent.change(input, { target: { value: '1' } });
            fireEvent.change(input, { target: { value: '12' } });
            fireEvent.change(input, { target: { value: '123' } });

            expect(mockUpdateDocument).toHaveBeenNthCalledWith(1, '1');
            expect(mockUpdateDocument).toHaveBeenNthCalledWith(2, '12');
            expect(mockUpdateDocument).toHaveBeenNthCalledWith(3, '123');
            expect(mockUpdateDocument).toHaveBeenCalledTimes(3);
        });

        it('should call clear when clear button is clicked', async () => {
            mockUseDocumentValidator.mockReturnValue({
                document: {
                    value: '12345678909',
                    formatted: '123.456.789-09',
                    isValid: true,
                    type: 'CPF',
                    error: undefined,
                },
                updateDocument: mockUpdateDocument,
                clear: mockClear,
                isValid: true,
                hasError: false,
            });

            const user = userEvent.setup();
            render(<DocumentInput />);

            const clearButton = screen.getByTestId('clear-button');
            await user.click(clearButton);

            expect(mockClear).toHaveBeenCalledTimes(1);
        });

        it('should have correct accessibility attributes on clear button', () => {
            mockUseDocumentValidator.mockReturnValue({
                document: {
                    value: '123',
                    formatted: '123',
                    isValid: false,
                    type: 'UNKNOWN',
                    error: undefined,
                },
                updateDocument: mockUpdateDocument,
                clear: mockClear,
                isValid: false,
                hasError: false,
            });

            render(<DocumentInput />);

            const clearButton = screen.getByTestId('clear-button');
            expect(clearButton.getAttribute('aria-label')).toBe('Limpar campo');
            expect(clearButton.getAttribute('title')).toBe('Limpar campo');
            expect(clearButton.getAttribute('type')).toBe('button');
        });
    });

    describe('Callback onValidationChange', () => {
        it('should call onValidationChange when validation state changes', () => {
            const onValidationChange = vi.fn();

            mockUseDocumentValidator.mockReturnValue({
                document: {
                    value: '12345678909',
                    formatted: '123.456.789-09',
                    isValid: true,
                    type: 'CPF',
                    error: undefined,
                },
                updateDocument: mockUpdateDocument,
                clear: mockClear,
                isValid: true,
                hasError: false,
            });

            render(<DocumentInput onValidationChange={onValidationChange} />);

            expect(onValidationChange).toHaveBeenCalledWith(true, 'CPF');
        });

        it('should call onValidationChange with invalid state', () => {
            const onValidationChange = vi.fn();

            mockUseDocumentValidator.mockReturnValue({
                document: {
                    value: '12345678901',
                    formatted: '123.456.789-01',
                    isValid: false,
                    type: 'CPF',
                    error: 'CPF inválido',
                },
                updateDocument: mockUpdateDocument,
                clear: mockClear,
                isValid: false,
                hasError: true,
            });

            render(<DocumentInput onValidationChange={onValidationChange} />);

            expect(onValidationChange).toHaveBeenCalledWith(false, 'CPF');
        });

        it('should not call onValidationChange when callback is not provided', () => {
            mockUseDocumentValidator.mockReturnValue({
                document: {
                    value: '',
                    formatted: '',
                    isValid: false,
                    type: 'UNKNOWN',
                    error: undefined,
                },
                updateDocument: mockUpdateDocument,
                clear: mockClear,
                isValid: false,
                hasError: false,
            });

            expect(() => render(<DocumentInput />)).not.toThrow();
        });
    });

    describe('Classes CSS', () => {
        it('should apply correct CSS classes for different states', () => {
            mockUseDocumentValidator.mockReturnValue({
                document: { value: '', formatted: '', isValid: false, type: 'UNKNOWN', error: undefined },
                updateDocument: mockUpdateDocument,
                clear: mockClear,
                isValid: false,
                hasError: false,
            });

            const { rerender } = render(<DocumentInput className="custom-class" />);
            let input = screen.getByTestId('document-input');
            expect(input.className).toBe('input-field custom-class');

            mockUseDocumentValidator.mockReturnValue({
                document: { value: '123', formatted: '123', isValid: true, type: 'CPF', error: undefined },
                updateDocument: mockUpdateDocument,
                clear: mockClear,
                isValid: true,
                hasError: false,
            });

            rerender(<DocumentInput className="custom-class" />);
            input = screen.getByTestId('document-input');
            expect(input.className).toBe('input-field valid custom-class');

            mockUseDocumentValidator.mockReturnValue({
                document: { value: '123', formatted: '123', isValid: false, type: 'CPF', error: 'Erro' },
                updateDocument: mockUpdateDocument,
                clear: mockClear,
                isValid: false,
                hasError: true,
            });

            rerender(<DocumentInput className="custom-class" />);
            input = screen.getByTestId('document-input');
            expect(input.className).toBe('input-field invalid custom-class');
        });

        it('should handle empty className prop', () => {
            render(<DocumentInput />);
            const input = screen.getByTestId('document-input');
            expect(input.className).toBe('input-field ');
        });
    });

    describe('Estrutura HTML e acessibilidade', () => {
        it('should have correct HTML structure', () => {
            const { container } = render(<DocumentInput />);

            expect(container.querySelector('.input-section')).toBeTruthy();
            expect(container.querySelector('.input-group')).toBeTruthy();
            expect(container.querySelector('.feedback-container')).toBeTruthy();

            const label = container.querySelector('label');
            const input = container.querySelector('input');
            expect(label?.getAttribute('for')).toBe(input?.getAttribute('id'));
        });

        it('should render all message elements correctly', () => {
            mockUseDocumentValidator.mockReturnValue({
                document: {
                    value: '12345678901',
                    formatted: '123.456.789-01',
                    isValid: false,
                    type: 'CPF',
                    error: 'CPF inválido',
                },
                updateDocument: mockUpdateDocument,
                clear: mockClear,
                isValid: false,
                hasError: true,
            });

            render(<DocumentInput />);

            const errorMessage = screen.getByTestId('error-message');
            expect(errorMessage.className).toBe('validation-feedback invalid');
            expect(errorMessage.querySelector('.icon')?.textContent).toBe('⚠');

            const documentType = screen.getByTestId('document-type');
            expect(documentType.className).toBe('document-type');
            expect(documentType.querySelector('strong')?.textContent).toBe('Tipo:');
        });

        it('should render success message with correct structure', () => {
            mockUseDocumentValidator.mockReturnValue({
                document: {
                    value: '12345678909',
                    formatted: '123.456.789-09',
                    isValid: true,
                    type: 'CPF',
                    error: undefined,
                },
                updateDocument: mockUpdateDocument,
                clear: mockClear,
                isValid: true,
                hasError: false,
            });

            render(<DocumentInput />);

            const successMessage = screen.getByTestId('success-message');
            expect(successMessage.className).toBe('validation-feedback valid');
            expect(successMessage.querySelector('.icon')?.textContent).toBe('✓');
        });
    });

    describe('Edge cases', () => {
        it('should handle undefined onValidationChange gracefully', () => {
            render(<DocumentInput onValidationChange={undefined} />);

            expect(screen.getByTestId('document-input')).toBeTruthy();
        });

        it('should handle all possible document types', () => {
            const types: Array<'CPF' | 'CNPJ' | 'UNKNOWN'> = ['CPF', 'CNPJ', 'UNKNOWN'];

            types.forEach(type => {
                mockUseDocumentValidator.mockReturnValue({
                    document: {
                        value: '123',
                        formatted: '123',
                        isValid: type !== 'UNKNOWN',
                        type,
                        error: type === 'UNKNOWN' ? 'Erro' : undefined,
                    },
                    updateDocument: mockUpdateDocument,
                    clear: mockClear,
                    isValid: type !== 'UNKNOWN',
                    hasError: type === 'UNKNOWN',
                });

                const { unmount } = render(<DocumentInput />);

                if (type !== 'UNKNOWN') {
                    expect(screen.getByTestId('document-type').textContent).toContain(`Tipo: ${type}`);
                } else {
                    expect(screen.queryByTestId('document-type')).toBeNull();
                }

                unmount();
            });
        });
    });
});
