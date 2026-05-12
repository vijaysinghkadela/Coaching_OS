import { formatCurrency, formatDate } from '@/lib/utils'

interface ReceiptData {
  receiptNumber: string
  paymentDate: string
  studentName: string
  enrollmentNo: string
  instituteName: string
  instituteAddress?: string
  gstin?: string
  feeName: string
  baseAmount: number
  gstRate: number
  gstAmount: number
  totalAmount: number
  amountPaid: number
  paymentMethod: string
  referenceNumber?: string
}

export function ReceiptTemplate({ data }: { data: ReceiptData }) {
  const cgst = data.gstAmount / 2
  const sgst = data.gstAmount / 2

  return (
    <div className="max-w-lg mx-auto p-8 bg-white text-gray-900 font-sans text-sm print:shadow-none shadow-lg rounded-lg">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-4 mb-4">
        <h1 className="text-xl font-bold text-gray-900">{data.instituteName}</h1>
        {data.instituteAddress && <p className="text-gray-500 text-xs mt-0.5">{data.instituteAddress}</p>}
        {data.gstin && <p className="text-xs text-gray-500 mt-0.5">GSTIN: {data.gstin}</p>}
        <p className="text-base font-semibold mt-2 text-primary">FEE RECEIPT</p>
      </div>

      {/* Receipt meta */}
      <div className="flex justify-between text-xs text-gray-500 mb-4">
        <div>
          <p><span className="font-medium text-gray-700">Receipt No:</span> {data.receiptNumber}</p>
          <p><span className="font-medium text-gray-700">Date:</span> {formatDate(data.paymentDate)}</p>
        </div>
        <div className="text-right">
          <p><span className="font-medium text-gray-700">Mode:</span> {data.paymentMethod.toUpperCase()}</p>
          {data.referenceNumber && <p><span className="font-medium text-gray-700">Ref:</span> {data.referenceNumber}</p>}
        </div>
      </div>

      {/* Student info */}
      <div className="bg-gray-50 rounded p-3 mb-4">
        <p><span className="font-medium">Student:</span> {data.studentName}</p>
        <p className="text-gray-500 text-xs mt-0.5">Enrollment: {data.enrollmentNo}</p>
      </div>

      {/* Fee breakdown */}
      <table className="w-full text-xs mb-4">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-1.5 font-medium text-gray-600">Description</th>
            <th className="text-right py-1.5 font-medium text-gray-600">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-1.5">{data.feeName}</td>
            <td className="text-right py-1.5">{formatCurrency(data.baseAmount)}</td>
          </tr>
          {data.gstRate > 0 && (
            <>
              <tr>
                <td className="py-1 text-gray-500">CGST @ {data.gstRate / 2}%</td>
                <td className="text-right py-1 text-gray-500">{formatCurrency(cgst)}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-500">SGST @ {data.gstRate / 2}%</td>
                <td className="text-right py-1 text-gray-500">{formatCurrency(sgst)}</td>
              </tr>
            </>
          )}
        </tbody>
        <tfoot className="border-t border-gray-300">
          <tr>
            <td className="pt-2 font-bold text-base">Total</td>
            <td className="pt-2 font-bold text-base text-right">{formatCurrency(data.totalAmount)}</td>
          </tr>
          <tr>
            <td className="pt-1 text-green-700 font-medium">Amount Paid</td>
            <td className="pt-1 text-green-700 font-medium text-right">{formatCurrency(data.amountPaid)}</td>
          </tr>
          {data.totalAmount > data.amountPaid && (
            <tr>
              <td className="pt-1 text-red-600 font-medium">Balance Due</td>
              <td className="pt-1 text-red-600 font-medium text-right">{formatCurrency(data.totalAmount - data.amountPaid)}</td>
            </tr>
          )}
        </tfoot>
      </table>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between text-xs text-gray-400">
        <p>This is a computer-generated receipt.</p>
        <p>Powered by Coaching OS</p>
      </div>
    </div>
  )
}
