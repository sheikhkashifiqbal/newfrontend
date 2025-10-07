import React from "react";

const plans = [
  {
    branch: "Branch name",
    subscription: "Central",
    dueDate: "12.12.24",
    dueColor: "text-red-500",
    autoRenew: true,
  },
  {
    branch: "Branch name",
    subscription: "Regional",
    dueDate: "12.12.24",
    dueColor: "text-green-500",
    autoRenew: true,
  },
];

const invoices = [
  { date: "14.04.2024", total: "$200.00", status: "Paid" },
  { date: "14.04.2024", total: "$200.00", status: "Paid" },
];

const MyPlans = () => {
  return (
    <div className="space-y-8 pb-20">
      {/* Plans Table */}
      <div>
        <h3 className="text-sm font-medium text-[#495057] mb-4">Plans</h3>
        <div className="rounded-2xl border border-[#E9ECEF] overflow-hidden">
          <table className="w-full table-auto divide-y divide-gray-200">
            <thead className="bg-[#F8F9FA] text-xs text-[#ADB5BD] text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 font-medium">Subscription type</th>
                <th className="px-4 py-3 font-medium">Due date</th>
                <th className="px-4 py-3 font-medium">Auto renewal</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#495057] divide-y divide-gray-200">
              {plans.map((plan, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? "bg-[#F8F9FA]" : ""}>
                  <td className="px-4 py-4">{plan.branch}</td>
                  <td className="px-4 py-4">{plan.subscription}</td>
                  <td className={`px-4 py-4 font-medium ${plan.dueColor}`}>
                    {plan.dueDate}
                  </td>
                  <td className="px-4 py-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={plan.autoRenew}
                        readOnly
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition-all relative">
                        <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-all peer-checked:translate-x-full" />
                      </div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoices Table */}
      <div>
        <h3 className="text-sm font-medium text-[#495057] mb-4">Invoices</h3>
        <div className="rounded-2xl overflow-hidden">
          <table className="w-full table-auto divide-y divide-gray-200">
            <thead className="text-xs text-[#ADB5BD] text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Invoice Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#495057] divide-y divide-gray-200">
              {invoices.map((invoice, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-4">{invoice.date}</td>
                  <td className="px-4 py-4">{invoice.total}</td>
                  <td className="px-4 py-4">{invoice.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyPlans