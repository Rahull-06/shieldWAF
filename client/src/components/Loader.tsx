export default function Loader({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center justify-center py-16 ${className}`}>
            <div className="w-6 h-6 border-2 border-border2 border-t-blue rounded-full animate-spin" />
        </div>
    )
}