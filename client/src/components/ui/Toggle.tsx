interface ToggleProps {
    checked: boolean;
    onChange: () => void;
    isLoading?: boolean;
}

export default function Toggle({ checked, onChange, isLoading }: ToggleProps) {
    return (
        <button
            onClick={onChange}
            disabled={isLoading}
            className={`
                relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none
                ${checked ? 'bg-accent' : 'bg-gray-700'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            <span
                className={`
                    absolute left-1 top-1 w-4 h-4 bg-dark-bg rounded-full transition-transform duration-200
                    ${checked ? 'translate-x-5' : 'translate-x-0'}
                `}
            />
        </button>
    );
}