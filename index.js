
const main = document.querySelector('main');
const root = document.querySelector(':root');
const input = document.getElementById('input');
const result = document.getElementById('result');

const allowedKeys = [
    "(", ")", "/", "*", "-", "+",
    "9", "8", "7", "6", "5",
    "4", "3", "2", "1", "0",
    ".", "%", " "
];

// Adiciona os caracteres à expressão
document.querySelectorAll('.charKey').forEach(function (charKeyBtn) {
    charKeyBtn.addEventListener('click', function () {
        input.value += charKeyBtn.dataset.value;
        input.focus();
    });
});

// Limpa a expressão e o resultado
document.getElementById('clear').addEventListener('click', function () {
    input.value = '';
    result.value = '';
    result.classList.remove('error');
    input.focus();
});

// Controla a entrada pelo teclado
input.addEventListener('keydown', function (ev) {
    ev.preventDefault();

    if (allowedKeys.includes(ev.key)) {
        input.value += ev.key;
        return;
    }

    if (ev.key === 'Backspace') {
        input.value = input.value.slice(0, -1);
        return;
    }

    if (ev.key === 'Enter') {
        calculate();
    }
});

// Botão de calcular
document.getElementById('equal').addEventListener('click', calculate);

// Interpreta e calcula a expressão matemática
function calculate() {
    result.classList.add('error');
    result.value = 'Erro';

    try {
        const expression = input.value.trim();

        if (!expression) {
            throw new Error('Expressão vazia');
        }

        const tokens = expression.match(/\d*\.?\d+|[()+\-*/%]/g);

        if (!tokens || tokens.join('') !== expression.replace(/\s/g, '')) {
            throw new Error('Expressão inválida');
        }

        let position = 0;

        function parseExpression() {
            let value = parseTerm();

            while (tokens[position] === '+' || tokens[position] === '-') {
                const operator = tokens[position++];

                const nextValue = parseTerm();

                value = operator === '+'
                    ? value + nextValue
                    : value - nextValue;
            }

            return value;
        }

        function parseTerm() {
            let value = parseFactor();

            while (['*', '/', '%'].includes(tokens[position])) {
                const operator = tokens[position++];

                const nextValue = parseFactor();

                if ((operator === '/' || operator === '%') && nextValue === 0) {
                    throw new Error('Divisão por zero');
                }

                if (operator === '*') value *= nextValue;
                if (operator === '/') value /= nextValue;
                if (operator === '%') value %= nextValue;
            }

            return value;
        }

        function parseFactor() {
            const token = tokens[position];

            if (token === '+' || token === '-') {
                position++;
                const value = parseFactor();
                return token === '-' ? -value : value;
            }

            if (token === '(') {
                position++;

                const value = parseExpression();

                if (tokens[position] !== ')') {
                    throw new Error('Parênteses inválidos');
                }

                position++;
                return value;
            }

            if (token === undefined || !/^\d*\.?\d+$/.test(token)) {
                throw new Error('Número inválido');
            }

            position++;
            return Number(token);
        }

        const calculation = parseExpression();

        if (position !== tokens.length || !Number.isFinite(calculation)) {
            throw new Error('Expressão inválida');
        }

        result.value = Number(calculation.toPrecision(12)).toString();
        result.classList.remove('error');

    } catch (error) {
        result.value = 'Erro';
    }
}

// Copia o resultado
document.getElementById('copyToClipboard').addEventListener('click', async function (ev) {
    const button = ev.currentTarget;

    if (!result.value || result.classList.contains('error')) {
        return;
    }

    try {
        await navigator.clipboard.writeText(result.value);

        button.innerText = 'Copiado!';
        button.classList.add('success');

        setTimeout(function () {
            button.innerText = 'Copiar';
            button.classList.remove('success');
        }, 1500);

    } catch (error) {
        button.innerText = 'Falha ao copiar';

        setTimeout(function () {
            button.innerText = 'Copiar';
        }, 1500);
    }
});

// Alterna entre tema escuro e claro
document.getElementById('themeSwitcher').addEventListener('click', function () {
    if (main.dataset.theme === 'dark') {
        root.style.setProperty('--bg-color', '#f1f5f9');
        root.style.setProperty('--border-color', '#aaa');
        root.style.setProperty('--font-color', '#212529');
        root.style.setProperty('--primary-color', '#26834a');

        main.dataset.theme = 'light';

    } else {
        root.style.setProperty('--bg-color', '#212529');
        root.style.setProperty('--border-color', '#666');
        root.style.setProperty('--font-color', '#f1f5f9');
        root.style.setProperty('--primary-color', '#4dff91');

        main.dataset.theme = 'dark';
    }
});
