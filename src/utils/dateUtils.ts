export const getQuarterDates = (quarter: string) => {
  const [year, q] = quarter.split(', ');
  const quarterNum = parseInt(q.replace('Q', ''));
  
  const startMonth = (quarterNum - 1) * 3;
  const endMonth = startMonth + 2;
  
  const start = new Date(parseInt(year), startMonth, 1);
  const end = new Date(parseInt(year), endMonth + 1, 0);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

export const getCurrentQuarter = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return `${year}, Q${quarter}`;
};