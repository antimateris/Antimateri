import React from 'react';
import { 
  MessageCircle, 
  Clock, 
  CheckCheck, 
  Send, 
  ExternalLink, 
  User,
  ShieldCheck
} from 'lucide-react';
import { WhatsAppNotificationLog } from '../../types';
import { formatDate, getWhatsAppDirectUrl } from '../../utils/helpers';

interface AdminWaLogsTabProps {
  logs: WhatsAppNotificationLog[];
}

export const AdminWaLogsTab: React.FC<AdminWaLogsTabProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-green-500/20 text-green-300 font-bold px-2 py-0.5 rounded border border-green-500/30">
              REAL-TIME WA LOGS
            </span>
            <h2 className="text-xl font-bold font-tactical text-white uppercase tracking-wider">
              RIWAYAT NOTIFIKASI WHATSAPP PELANGGAN
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Log pesan WhatsApp yang otomatis dikirim ke pelanggan saat status pesanan diperbarui
          </p>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-green-400 font-semibold bg-green-950/40 px-3 py-1.5 rounded-xl border border-green-500/30">
          <CheckCheck className="w-4 h-4" />
          <span>{logs.length} Notifikasi Terkirim</span>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row gap-4 justify-between"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  {log.invoiceNumber}
                </span>
                <span className="font-bold text-white flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  {log.customerName}
                </span>
                <span className="font-mono text-green-400">
                  ({log.customerPhone})
                </span>
                <span className="text-zinc-500 font-mono">
                  • {formatDate(log.sentAt)}
                </span>
              </div>

              <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 font-mono whitespace-pre-line leading-relaxed">
                {log.message}
              </p>
            </div>

            <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 shrink-0">
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCheck className="w-3.5 h-3.5" />
                {log.status === 'read' ? 'Dibaca Pelanggan' : 'Terkirim Real-Time'}
              </span>

              <a
                href={getWhatsAppDirectUrl(log.customerPhone, log.message)}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-zinc-800 hover:bg-green-600 hover:text-white text-zinc-300 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
              >
                <Send className="w-3 h-3" />
                <span>Buka di WhatsApp</span>
              </a>
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center text-xs text-zinc-500">
            Belum ada notifikasi WhatsApp yang terkirim. Buat pesanan baru atau update status joki untuk memicu notifikasi.
          </div>
        )}
      </div>

    </div>
  );
};
