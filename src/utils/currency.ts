export function formatCurrencyBRL(value: string) {
  const onlyNumbers = value.replace(/\D/g, "");
  const amount = Number(onlyNumbers) / 100;

  return amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


export function parseCurrency(value: string): number {
  return (
    parseFloat(
      value.replace(/\./g, '').replace(',', '.').replace('R$', ''),
    ) || 0
  )
}