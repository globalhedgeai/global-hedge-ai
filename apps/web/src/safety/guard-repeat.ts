if (process.env.NODE_ENV !== "production") {
  const origRepeat = String.prototype.repeat as (this: string, count: number) => string;

  (String.prototype as unknown as { repeat(count: number): string }).repeat = function (count: number) {
    if (typeof count === "number" && count < 0) {
      try {
        console.error("[guard-repeat] negative repeat count detected:", count, "\n", new Error().stack);
      } catch {}
      count = 0;
    }
    return origRepeat.call(this as string, count);
  };
}
