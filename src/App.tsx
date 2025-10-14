import { useState } from 'react';
import { DocumentInput } from './components/DocumentInput';

function App() {
    const [validationStatus, setValidationStatus] = useState<{
        isValid: boolean;
        type: string;
    }>({ isValid: false, type: 'UNKNOWN' });

    return (
        <div className="app">
            <div className="container">
                <h1>Validador de CPF/CNPJ</h1>

                <DocumentInput
                    onValidationChange={(isValid, type) =>
                        setValidationStatus({ isValid, type })
                    }
                />

                <div className="validation-results">
                    <h3>Status da Validação</h3>
                    <p>
                        <strong>Válido:</strong>{' '}
                        <span className={validationStatus.isValid ? 'status-valid' : 'status-invalid'}>
              {validationStatus.isValid ? 'Sim' : 'Não'}
            </span>
                    </p>
                    <p>
                        <strong>Tipo:</strong>{' '}
                        <span>{validationStatus.type}</span>
                    </p>
                </div>

                <div className="examples-section">
                    <h3>Exemplos válidos</h3>
                    <p><strong>CPF:</strong> 123.456.789-09</p>
                    <p><strong>CNPJ:</strong> 11.222.333/0001-81</p>
                </div>
            </div>
        </div>
    );
}

export default App;
