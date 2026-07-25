"use client"

import React, { useState } from "react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function ReportsPage() {
    // Tusaale xog ah (Waxaad tan ku bedeli kartaa xogtaada ka timaada Supabase)
    const [reportData] = useState([
        { id: 1, item: "Dirays Shihaabi", category: "Dharka Haweenka", qty: 3, price: 45, date: "2026-07-20" },
        { id: 2, item: "Shaar casri ah", category: "Labiska", qty: 5, price: 25, date: "2026-07-21" },
        { id: 3, item: "Kabaha Arooska", category: "Kabaha", qty: 2, price: 60, date: "2026-07-22" },
    ])

    // 1. Shaqada soo dejinta Excel
    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(reportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Warbixinta Iibka")
        XLSX.writeFile(workbook, "Kafaya_Boutique_Report.xlsx")
    }

    // 2. Shaqada soo dejinta PDF
    const exportToPDF = () => {
        const doc = new jsPDF()

        // Madaxa Warbixinta
        doc.setFontSize(18)
        doc.text("Kafaya Boutique - Warbixinta Rasmiga ah", 14, 20)

        doc.setFontSize(11)
        doc.setTextColor(100)
        doc.text(`Taariikhda: ${new Date().toLocaleDateString()}`, 14, 28)

        // Miiska Xogta ee PDF-ka
        autoTable(doc, {
            startY: 35,
            head: [["ID", "Magaca Alaabta", "Qeybta", "Tirada", "Qiimaha ($)", "Taariikhda"]],
            body: reportData.map(row => [row.id, row.item, row.category, row.qty, row.price, row.date]),
            headStyles: { fillColor: [30, 41, 59] },
        })

        doc.save("Kafaya_Boutique_Report.pdf")
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Warbixinta & Soo dejinta (Reports)</h1>
                    <p className="text-sm text-slate-500">Ka soo dejiso xogta dukaanka qaab Excel ama PDF ah.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={exportToExcel}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                    >
                        Soo deji Excel 📊
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                    >
                        Soo deji PDF 📄
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-sm">
                            <th className="p-3">ID</th>
                            <th className="p-3">Magaca Alaabta</th>
                            <th className="p-3">Qeybta</th>
                            <th className="p-3">Tirada</th>
                            <th className="p-3">Qiimaha</th>
                            <th className="p-3">Taariikhda</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                        {reportData.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/50">
                                <td className="p-3">{row.id}</td>
                                <td className="p-3 font-medium text-slate-800">{row.item}</td>
                                <td className="p-3">{row.category}</td>
                                <td className="p-3">{row.qty}</td>
                                <td className="p-3">${row.price}</td>
                                <td className="p-3">{row.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}