import { Zap } from "lucide-react"

function Logo () {
    return(
        <div className="flex items-center gap-2">
            <i className="inline-flex justify-center items-center bg-[#7c5bf5] w-9 h-9 rounded-lg"><Zap color="#fff" size={18}/></i>
            <span className="text-white">Spendly</span>
        </div>
    )
}

export default Logo;