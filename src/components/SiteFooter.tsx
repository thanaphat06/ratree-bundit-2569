import { EVENT } from '../config/event'

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-stone/15 px-6 py-8 text-center text-sm text-ink/60">
      <p className="mb-2 font-medium text-ink/80">{EVENT.organizer}</p>
      <div className="flex items-center justify-center gap-4">
        <a href={EVENT.facebook.url} target="_blank" rel="noreferrer" className="hover:text-orange">
          FB: {EVENT.facebook.label}
        </a>
        <span className="text-stone/40">·</span>
        <a href={EVENT.instagram.url} target="_blank" rel="noreferrer" className="hover:text-orange">
          IG: {EVENT.instagram.label}
        </a>
      </div>
    </footer>
  )
}
