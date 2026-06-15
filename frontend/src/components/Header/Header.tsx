import {useState} from "react";
import {Link, useLocation} from "react-router-dom";
import Logo from "../Logo/Logo.tsx";

function Header() {
    const {pathname} = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        {id: "summary", label: "Podsumowanie", href: "/summary"},
        {id: "transactions", label: "Transakcje", href: "/transactions"},
        {id: "wallets", label: "Portfele", href: "/wallets"},
        {id: "goals", label: "Cele", href: "/goals"},
        {id: "budgets", label: "Budżety", href: "/budgets"},
    ];

    return (
        <>
            <header
                className="w-full px-6 py-4 flex items-center justify-between bg-[var(--color-dark)] shadow-[var(--box-shadow)] relative z-50">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all">
                    <Logo/>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.id}
                            to={link.href}
                            className={`px-4 py-2 font-medium transition-all cursor-pointer rounded-[var(--radius)] ${
                                pathname === link.href
                                    ? "bg-[var(--color-primary)] text-white hover:opacity-90"
                                    : "bg-transparent text-white hover:bg-gray-100 hover:text-black"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Icons */}
                <div className="hidden md:flex items-center gap-4">
                    <button
                        className="p-2 rounded-full bg-[var(--color-bg)] hover:bg-gray-200 transition-all cursor-pointer">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                        </svg>
                    </button>

                    <a
                        href="/settings"
                        className="p-2 rounded-full bg-[var(--color-bg)] hover:bg-gray-200 transition-all cursor-pointer">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </a>

                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-all bg-[var(--color-primary)]"
                    >
                        <span className="text-white font-semibold">U</span>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-all duration-300 ${mobileMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}
                    >
                        <path d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`absolute transition-all duration-300 ${mobileMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
                    >
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                onClick={() => setMobileMenuOpen(false)}
                className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
                    mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            {/* Mobile Menu Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-72 bg-white z-50 md:hidden shadow-2xl transition-transform duration-300 ease-out ${
                    mobileMenuOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-primary)]">
                                <span className="text-white font-semibold">U</span>
                            </div>
                            <div>
                                <p className="font-semibold text-[var(--color-text)]">Użytkownik</p>
                                <p className="text-sm text-gray-500">user@email.com</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Navigation Links */}
                    <nav className="flex-1 p-4">
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.id}
                                    to={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                        pathname === link.href
                                            ? "bg-[var(--color-primary)] text-white"
                                            : "text-[var(--color-text)] hover:bg-gray-100"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-1">
                            <a
                                href="/notifications"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[var(--color-text)] hover:bg-gray-100 transition-all"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                                </svg>
                                Powiadomienia
                            </a>
                            <a
                                href="/settings"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[var(--color-text)] hover:bg-gray-100 transition-all"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                Ustawienia
                            </a>
                        </div>
                    </nav>

                    {/* Mobile Menu Footer */}
                    <div className="p-4 border-t border-gray-100">
                        <button
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            Wyloguj się
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Header;
