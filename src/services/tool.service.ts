export const ToolService = {
  calculator(expr: string): string {
    try {
      const safe = expr.replace(/[^0-9+\-*/().]/g, "");
      return String(Function(`return (${safe})`)());
    } catch {
      return "Invalid expression";
    }
  },
};
