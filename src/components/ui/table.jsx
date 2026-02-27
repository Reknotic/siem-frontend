// src/components/ui/table.jsx
export function Table({ children }) {
  return <table className="min-w-full">{children}</table>;
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableCell({ children }) {
  return <td className="border px-4 py-2">{children}</td>;
}

export function TableRow({ children }) {
  return <tr>{children}</tr>;
}

// Add TableHead component
export function TableHead({ children }) {
  return <thead>{children}</thead>;
}
// TableHeader to define the column headers in the table
export function TableHeader({ children }) {
  return <th className="border px-4 py-2 text-left">{children}</th>;
}