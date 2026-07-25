"use client"

import React, { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

export default function StoreChatPage() {
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Soo jiido xogta isticmaalaha iyo farriimihii hore
    useEffect(() => {
        async function fetchUserAndMessages() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            const { data } = await supabase
                .from("messages")
                .select("*")
                .order("created_at", { ascending: true })

            if (data) setMessages(data)
        }

        fetchUserAndMessages()

        // Dhageysiga farriimaha cusub ee Realtime ah
        const channel = supabase
            .channel("realtime-messages")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages" },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    // Si uu chat-ku ugu dambeeyo hoos u soo laabto marka farriin timaado
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Shaqada dirista farriinta
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !user) return

        const { error } = await supabase.from("messages").insert({
            sender_id: user.id,
            sender_name: user.email?.split("@")[0] || "Staff",
            content: newMessage,
        })

        if (!error) {
            setNewMessage("")
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto h-[85vh] flex flex-col justify-between bg-white rounded-xl shadow-sm border border-slate-200">
            {/* Madaxa Chat-ka */}
            <div className="border-b border-slate-200 pb-4 mb-4">
                <h1 className="text-xl font-bold text-slate-800">Wadahadalka Dukaanka (Admin & Staff Chat)</h1>
                <p className="text-xs text-slate-500">Halkan waxaad kala socon kartaan amarrada iyo xogta maalinlaha ah.</p>
            </div>

            {/* Qeybta Farriimaha lagu kala dirayo */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id
                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            <span className="text-[11px] text-slate-400 mb-1 px-1">{msg.sender_name}</span>
                            <div
                                className={`max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMe
                                        ? "bg-slate-900 text-white rounded-br-none"
                                        : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Foomka Farriinta lagu qoro */}
            <form onSubmit={sendMessage} className="mt-4 flex gap-2 pt-3 border-t border-slate-200">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Qor farriintaada halkan..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
                >
                    Dir 🚀
                </button>
            </form>
        </div>
    )
}