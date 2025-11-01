// src/utils/searchStatus.ts
export type SearchStatusMessages = {
    startTyping: string;
    loading: string;
    errorPrefix: string; // добавится перед текстом ошибки
    results: (n: number) => string;
    nothingFound: string;
};

export type SearchStatusParams = {
    query: string;
    loading?: boolean;
    error?: unknown;
    resultsLength?: number;
    messages?: Partial<SearchStatusMessages>;
};

const DEFAULT_MESSAGES: SearchStatusMessages = {
    startTyping: "Start typing to see results",
    loading: "We are looking for…",
    errorPrefix: "Error:",
    results: (n) => `${n} results`,
    nothingFound: "Nothing found",
};

export function getSearchStatus({
    query,
    loading,
    error,
    resultsLength = 0,
    messages,
}: SearchStatusParams): string {
    const msg = { ...DEFAULT_MESSAGES, ...messages };

    if (!query) return msg.startTyping;
    if (loading) return msg.loading;

    if (error) {
        const text =
            typeof error === "string"
                ? error
                : (error as any)?.message ?? "Unknown error";
        return `${msg.errorPrefix} ${text}`;
    }

    if (resultsLength > 0) return msg.results(resultsLength);
    return msg.nothingFound;
}
