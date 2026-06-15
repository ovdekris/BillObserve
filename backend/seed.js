require('dotenv').config({ path: './config/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Modele
const User = require('./models/User');
const Category = require('./models/Category');
const Wallet = require('./models/Wallet');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');
const Goal = require('./models/Goal');
const AssetItem = require('./models/AssetItem');

const connectDB = require('./config/db');

// Dane testowe
const seedData = async () => {
    try {
        await connectDB();

        // Email użytkownika, dla którego tworzymy dane
        const userEmail = 'ovde.kris4@gmail.com';

        // Znajdź użytkownika
        console.log(`Szukanie użytkownika ${userEmail}...`);
        let user = await User.findOne({ email: userEmail }).select('+password');

        if (user) {
            // Jeśli użytkownik istnieje, wyczyść jego dane i zaktualizuj hasło
            console.log('Użytkownik istnieje. Czyszczenie danych użytkownika...');
            await Category.deleteMany({ user: user._id });
            await Wallet.deleteMany({ user: user._id });
            await Transaction.deleteMany({ user: user._id });
            await Budget.deleteMany({ user: user._id });
            await Goal.deleteMany({ user: user._id });
            await AssetItem.deleteMany({ user: user._id });

            // Zaktualizuj hasło
            user.password = 'Haslo123!';
            await user.save();
            console.log('Dane użytkownika wyczyszczone i hasło zaktualizowane.');
        } else {
            // Jeśli użytkownik nie istnieje, utwórz go
            console.log('Tworzenie nowego użytkownika...');
            user = await User.create({
                email: userEmail,
                password: 'Haslo123!',
                name: 'Kristina',
                currency: 'PLN',
                settings: {
                    notifications: true,
                    darkMode: false,
                    language: 'pl'
                }
            });
            console.log(`Nowy użytkownik utworzony: ${userEmail}`);
        }

        console.log(`Użytkownik: ${userEmail} / Haslo123!`);

        // 2. Kategorie - struktura z PDF
        console.log('Tworzenie kategorii...');

        // Główne kategorie wydatków
        const catZakupy = await Category.create({ user: user._id, name: 'Zakupy', type: 'expense', color: '#F48FB1', order: 1 });
        const catDzieciEdukacja = await Category.create({ user: user._id, name: 'Dzieci i edukacja', type: 'expense', color: '#FFD54F', order: 2 });
        const catMieszkanie = await Category.create({ user: user._id, name: 'Mieszkanie, dom i ogród', type: 'expense', color: '#90CAF9', order: 3 });
        const catOsobiste = await Category.create({ user: user._id, name: 'Osobiste', type: 'expense', color: '#A5D6A7', order: 4 });
        const catPodatki = await Category.create({ user: user._id, name: 'Podatki', type: 'expense', color: '#FFAB91', order: 5 });
        const catPrezenty = await Category.create({ user: user._id, name: 'Prezenty i darowizny', type: 'expense', color: '#CE93D8', order: 6 });
        const catRachunki = await Category.create({ user: user._id, name: 'Rachunki i media', type: 'expense', color: '#EF9A9A', order: 7 });
        const catRozrywka = await Category.create({ user: user._id, name: 'Rozrywka', type: 'expense', color: '#FFD54F', order: 8 });
        const catSamochod = await Category.create({ user: user._id, name: 'Samochód', type: 'expense', color: '#80DEEA', order: 9 });
        const catUslugi = await Category.create({ user: user._id, name: 'Usługi biznesowe', type: 'expense', color: '#F8BBD9', order: 10 });
        const catZdrowie = await Category.create({ user: user._id, name: 'Zdrowie', type: 'expense', color: '#C8E6C9', order: 11 });
        const catBrak = await Category.create({ user: user._id, name: 'Brak kategorii', type: 'expense', color: '#E0E0E0', order: 12 });

        // Główna kategoria przychodów
        const catPrzychod = await Category.create({ user: user._id, name: 'Przychód', type: 'income', color: '#66BB6A', order: 1 });

        // Podkategorie - Zakupy
        await Category.insertMany([
            { user: user._id, name: 'Spożywcze', type: 'expense', parent: catZakupy._id, color: '#F48FB1', order: 1 },
            { user: user._id, name: 'Papierosy', type: 'expense', parent: catZakupy._id, color: '#F48FB1', order: 2 },
            { user: user._id, name: 'Gazety i czasopisma', type: 'expense', parent: catZakupy._id, color: '#F48FB1', order: 3 },
            { user: user._id, name: 'Chemia', type: 'expense', parent: catZakupy._id, color: '#F48FB1', order: 4 },
            { user: user._id, name: 'Hobby', type: 'expense', parent: catZakupy._id, color: '#F48FB1', order: 5 },
            { user: user._id, name: 'Odzież i obuwie', type: 'expense', parent: catZakupy._id, color: '#F48FB1', order: 6 },
            { user: user._id, name: 'Elektronika i oprogramowanie', type: 'expense', parent: catZakupy._id, color: '#F48FB1', order: 7 },
            { user: user._id, name: 'Alkohol', type: 'expense', parent: catZakupy._id, color: '#F48FB1', order: 8 },
            { user: user._id, name: 'Inne zakupy', type: 'expense', parent: catZakupy._id, color: '#F48FB1', order: 9 },
        ]);

        // Podkategorie - Dzieci i edukacja
        await Category.insertMany([
            { user: user._id, name: 'Edukacja i rozwój osobisty', type: 'expense', parent: catDzieciEdukacja._id, color: '#FFD54F', order: 1 },
            { user: user._id, name: 'Przedszkole i opiekunka', type: 'expense', parent: catDzieciEdukacja._id, color: '#FFD54F', order: 2 },
            { user: user._id, name: 'Zabawki', type: 'expense', parent: catDzieciEdukacja._id, color: '#FFD54F', order: 3 },
            { user: user._id, name: 'Inne (dzieci i edukacja)', type: 'expense', parent: catDzieciEdukacja._id, color: '#FFD54F', order: 4 },
        ]);

        // Podkategorie - Mieszkanie, dom i ogród
        await Category.insertMany([
            { user: user._id, name: 'Kredyt hipoteczny', type: 'expense', parent: catMieszkanie._id, color: '#90CAF9', order: 1 },
            { user: user._id, name: 'Meble, sprzęt, wyposażenie', type: 'expense', parent: catMieszkanie._id, color: '#90CAF9', order: 2 },
            { user: user._id, name: 'Ogród', type: 'expense', parent: catMieszkanie._id, color: '#90CAF9', order: 3 },
            { user: user._id, name: 'Remont i rozbudowa', type: 'expense', parent: catMieszkanie._id, color: '#90CAF9', order: 4 },
            { user: user._id, name: 'Usługi dla mieszkania, domu', type: 'expense', parent: catMieszkanie._id, color: '#90CAF9', order: 5 },
            { user: user._id, name: 'Inne (mieszkanie, dom)', type: 'expense', parent: catMieszkanie._id, color: '#90CAF9', order: 6 },
        ]);

        // Podkategorie - Osobiste
        await Category.insertMany([
            { user: user._id, name: 'Kosmetyki i higiena osobista', type: 'expense', parent: catOsobiste._id, color: '#A5D6A7', order: 1 },
            { user: user._id, name: 'Bilety i taksówki', type: 'expense', parent: catOsobiste._id, color: '#A5D6A7', order: 2 },
            { user: user._id, name: 'Sport', type: 'expense', parent: catOsobiste._id, color: '#A5D6A7', order: 3 },
            { user: user._id, name: 'Włosy', type: 'expense', parent: catOsobiste._id, color: '#A5D6A7', order: 4 },
            { user: user._id, name: 'Masaż, solarium, spa', type: 'expense', parent: catOsobiste._id, color: '#A5D6A7', order: 5 },
            { user: user._id, name: 'Zwierzęta', type: 'expense', parent: catOsobiste._id, color: '#A5D6A7', order: 6 },
            { user: user._id, name: 'Spłata pożyczki', type: 'expense', parent: catOsobiste._id, color: '#A5D6A7', order: 7 },
            { user: user._id, name: 'Udzielenie pożyczki', type: 'expense', parent: catOsobiste._id, color: '#A5D6A7', order: 8 },
            { user: user._id, name: 'Ubezpieczenie na życie', type: 'expense', parent: catOsobiste._id, color: '#A5D6A7', order: 9 },
            { user: user._id, name: 'Inne osobiste', type: 'expense', parent: catOsobiste._id, color: '#A5D6A7', order: 10 },
        ]);

        // Podkategorie - Podatki
        await Category.insertMany([
            { user: user._id, name: 'Podatek dochodowy', type: 'expense', parent: catPodatki._id, color: '#FFAB91', order: 1 },
            { user: user._id, name: 'VAT', type: 'expense', parent: catPodatki._id, color: '#FFAB91', order: 2 },
            { user: user._id, name: 'ZUS', type: 'expense', parent: catPodatki._id, color: '#FFAB91', order: 3 },
            { user: user._id, name: 'Podatek "Belki"', type: 'expense', parent: catPodatki._id, color: '#FFAB91', order: 4 },
            { user: user._id, name: 'Inne podatki i opłaty', type: 'expense', parent: catPodatki._id, color: '#FFAB91', order: 5 },
        ]);

        // Podkategorie - Prezenty i darowizny
        await Category.insertMany([
            { user: user._id, name: 'Charytatywne', type: 'expense', parent: catPrezenty._id, color: '#CE93D8', order: 1 },
            { user: user._id, name: 'Kościół', type: 'expense', parent: catPrezenty._id, color: '#CE93D8', order: 2 },
            { user: user._id, name: 'Prezent', type: 'expense', parent: catPrezenty._id, color: '#CE93D8', order: 3 },
        ]);

        // Podkategorie - Rachunki i media
        await Category.insertMany([
            { user: user._id, name: 'Prąd', type: 'expense', parent: catRachunki._id, color: '#EF9A9A', order: 1 },
            { user: user._id, name: 'Gaz', type: 'expense', parent: catRachunki._id, color: '#EF9A9A', order: 2 },
            { user: user._id, name: 'Internet', type: 'expense', parent: catRachunki._id, color: '#EF9A9A', order: 3 },
            { user: user._id, name: 'Komórka', type: 'expense', parent: catRachunki._id, color: '#EF9A9A', order: 4 },
            { user: user._id, name: 'Telefon stacjonarny', type: 'expense', parent: catRachunki._id, color: '#EF9A9A', order: 5 },
            { user: user._id, name: 'Kablówka i satelita', type: 'expense', parent: catRachunki._id, color: '#EF9A9A', order: 6 },
            { user: user._id, name: 'Czynsz i wynajem', type: 'expense', parent: catRachunki._id, color: '#EF9A9A', order: 7 },
            { user: user._id, name: 'Woda', type: 'expense', parent: catRachunki._id, color: '#EF9A9A', order: 8 },
            { user: user._id, name: 'Kanalizacja', type: 'expense', parent: catRachunki._id, color: '#EF9A9A', order: 9 },
            { user: user._id, name: 'Ubezpieczenie mieszkania, domu', type: 'expense', parent: catRachunki._id, color: '#EF9A9A', order: 10 },
            { user: user._id, name: 'Opłaty i prowizje bankowe', type: 'expense', parent: catRachunki._id, color: '#EF9A9A', order: 11 },
            { user: user._id, name: 'Inne rachunki', type: 'expense', parent: catRachunki._id, color: '#EF9A9A', order: 12 },
        ]);

        // Podkategorie - Rozrywka
        await Category.insertMany([
            { user: user._id, name: 'Restauracje, puby, kluby', type: 'expense', parent: catRozrywka._id, color: '#FFD54F', order: 1 },
            { user: user._id, name: 'Filmy, gry, płyty', type: 'expense', parent: catRozrywka._id, color: '#FFD54F', order: 2 },
            { user: user._id, name: 'Książki, kino, teatr', type: 'expense', parent: catRozrywka._id, color: '#FFD54F', order: 3 },
            { user: user._id, name: 'Wyjazdy, podróże, wakacje', type: 'expense', parent: catRozrywka._id, color: '#FFD54F', order: 4 },
            { user: user._id, name: 'Loterie, kasyna, hazard', type: 'expense', parent: catRozrywka._id, color: '#FFD54F', order: 5 },
            { user: user._id, name: 'Inne formy rozrywki', type: 'expense', parent: catRozrywka._id, color: '#FFD54F', order: 6 },
        ]);

        // Podkategorie - Samochód
        await Category.insertMany([
            { user: user._id, name: 'Paliwo', type: 'expense', parent: catSamochod._id, color: '#80DEEA', order: 1 },
            { user: user._id, name: 'Parkowanie', type: 'expense', parent: catSamochod._id, color: '#80DEEA', order: 2 },
            { user: user._id, name: 'Serwis i części', type: 'expense', parent: catSamochod._id, color: '#80DEEA', order: 3 },
            { user: user._id, name: 'Opłaty', type: 'expense', parent: catSamochod._id, color: '#80DEEA', order: 4 },
            { user: user._id, name: 'OC / AC', type: 'expense', parent: catSamochod._id, color: '#80DEEA', order: 5 },
            { user: user._id, name: 'Inne (samochód)', type: 'expense', parent: catSamochod._id, color: '#80DEEA', order: 6 },
        ]);

        // Podkategorie - Usługi biznesowe
        await Category.insertMany([
            { user: user._id, name: 'Marketing', type: 'expense', parent: catUslugi._id, color: '#F8BBD9', order: 1 },
            { user: user._id, name: 'Prawne i księgowe', type: 'expense', parent: catUslugi._id, color: '#F8BBD9', order: 2 },
            { user: user._id, name: 'Internet, serwery, domeny', type: 'expense', parent: catUslugi._id, color: '#F8BBD9', order: 3 },
            { user: user._id, name: 'Zaopatrzenie biura', type: 'expense', parent: catUslugi._id, color: '#F8BBD9', order: 4 },
            { user: user._id, name: 'Zakup towarów', type: 'expense', parent: catUslugi._id, color: '#F8BBD9', order: 5 },
            { user: user._id, name: 'Inne usługi biznesowe', type: 'expense', parent: catUslugi._id, color: '#F8BBD9', order: 6 },
        ]);

        // Podkategorie - Zdrowie
        await Category.insertMany([
            { user: user._id, name: 'Lekarstwa', type: 'expense', parent: catZdrowie._id, color: '#C8E6C9', order: 1 },
            { user: user._id, name: 'Dentysta', type: 'expense', parent: catZdrowie._id, color: '#C8E6C9', order: 2 },
            { user: user._id, name: 'Okulista', type: 'expense', parent: catZdrowie._id, color: '#C8E6C9', order: 3 },
            { user: user._id, name: 'Lekarz (inny)', type: 'expense', parent: catZdrowie._id, color: '#C8E6C9', order: 4 },
            { user: user._id, name: 'Ubezpieczenie zdrowotne', type: 'expense', parent: catZdrowie._id, color: '#C8E6C9', order: 5 },
            { user: user._id, name: 'Inne (zdrowie)', type: 'expense', parent: catZdrowie._id, color: '#C8E6C9', order: 6 },
        ]);

        // Podkategorie - Brak kategorii
        await Category.insertMany([
            { user: user._id, name: 'Brak kategorii', type: 'expense', parent: catBrak._id, color: '#E0E0E0', order: 1 },
        ]);

        // Podkategorie - Przychód
        await Category.insertMany([
            { user: user._id, name: 'Pensja', type: 'income', parent: catPrzychod._id, color: '#66BB6A', order: 1 },
            { user: user._id, name: 'Zapłata za usługę', type: 'income', parent: catPrzychod._id, color: '#66BB6A', order: 2 },
            { user: user._id, name: 'Sprzedaż towarów', type: 'income', parent: catPrzychod._id, color: '#66BB6A', order: 3 },
            { user: user._id, name: 'Premia, nagroda', type: 'income', parent: catPrzychod._id, color: '#66BB6A', order: 4 },
            { user: user._id, name: 'Otrzymany prezent', type: 'income', parent: catPrzychod._id, color: '#66BB6A', order: 5 },
            { user: user._id, name: 'Inwestycje finansowe', type: 'income', parent: catPrzychod._id, color: '#66BB6A', order: 6 },
            { user: user._id, name: 'Zwrot (pożyczki, podatku, zakupu)', type: 'income', parent: catPrzychod._id, color: '#66BB6A', order: 7 },
            { user: user._id, name: 'Odsetki bankowe', type: 'income', parent: catPrzychod._id, color: '#66BB6A', order: 8 },
            { user: user._id, name: 'Inne przychody', type: 'income', parent: catPrzychod._id, color: '#66BB6A', order: 9 },
        ]);

        // 4. Portfele
        console.log('Tworzenie portfeli...');
        const wallets = await Wallet.insertMany([
            { user: user._id, name: 'Gotówka', type: 'cash', balance: 500, currency: 'PLN', color: '#2ECC71', icon: 'wallet', includeInTotal: true },
            { user: user._id, name: 'Konto główne', type: 'bank', balance: 8500, currency: 'PLN', color: '#3498DB', icon: 'university', includeInTotal: true },
            { user: user._id, name: 'Konto oszczędnościowe', type: 'savings', balance: 15000, currency: 'PLN', color: '#9B59B6', icon: 'piggy-bank', includeInTotal: true },
            { user: user._id, name: 'Karta kredytowa', type: 'credit_card', balance: -1200, currency: 'PLN', color: '#E74C3C', icon: 'credit-card', includeInTotal: true },
            { user: user._id, name: 'Inwestycje', type: 'investment', balance: 25000, currency: 'PLN', color: '#F39C12', icon: 'chart-pie', includeInTotal: true }
        ]);

        const [gotowka, kontoGlowne, oszczednosci, karta, inwestycje] = wallets;

        // 5. Transakcje - cały rok 2026
        console.log('Tworzenie transakcji...');
        const transactions = [];
        const now = new Date();
        const currentMonth = now.getMonth(); // 0-11
        const currentYear = now.getFullYear();

        // Generuj transakcje dla każdego miesiąca do bieżącego włącznie
        for (let month = 0; month <= currentMonth; month++) {
            // PRZYCHODY
            // Pensja miesięczna (zawsze 1. dnia miesiąca)
            transactions.push({
                user: user._id,
                wallet: kontoGlowne._id,
                category: catPrzychod._id,
                type: 'income',
                amount: 8500,
                date: new Date(currentYear, month, 1),
                description: 'Wypłata za miesiąc'
            });

            // Freelance co drugi miesiąc
            if (month % 2 === 0) {
                transactions.push({
                    user: user._id,
                    wallet: kontoGlowne._id,
                    category: catPrzychod._id,
                    type: 'income',
                    amount: Math.floor(Math.random() * 1500) + 1500,
                    date: new Date(currentYear, month, 15),
                    description: 'Projekt dla klienta'
                });
            }

            // WYDATKI STAŁE MIESIĘCZNE
            // Rachunki i media - Czynsz
            transactions.push({
                user: user._id,
                wallet: kontoGlowne._id,
                category: catRachunki._id,
                type: 'expense',
                amount: 1500,
                date: new Date(currentYear, month, 5),
                description: 'Czynsz'
            });

            // Rachunki - Prąd
            transactions.push({
                user: user._id,
                wallet: kontoGlowne._id,
                category: catRachunki._id,
                type: 'expense',
                amount: Math.floor(Math.random() * 100) + 150,
                date: new Date(currentYear, month, 10),
                description: 'Prąd'
            });

            // Rachunki - Internet
            transactions.push({
                user: user._id,
                wallet: kontoGlowne._id,
                category: catRachunki._id,
                type: 'expense',
                amount: 80,
                date: new Date(currentYear, month, 10),
                description: 'Internet'
            });

            // Rachunki - Komórka
            transactions.push({
                user: user._id,
                wallet: kontoGlowne._id,
                category: catRachunki._id,
                type: 'expense',
                amount: 50,
                date: new Date(currentYear, month, 12),
                description: 'Telefon komórkowy'
            });

            // Samochód - Paliwo (2-4 razy w miesiącu)
            const fuelTransactions = Math.floor(Math.random() * 3) + 2;
            for (let i = 0; i < fuelTransactions; i++) {
                transactions.push({
                    user: user._id,
                    wallet: karta._id,
                    category: catSamochod._id,
                    type: 'expense',
                    amount: Math.floor(Math.random() * 100) + 150,
                    date: new Date(currentYear, month, Math.floor(Math.random() * 28) + 1),
                    description: 'Paliwo'
                });
            }

            // Zakupy spożywcze (8-15 razy w miesiącu)
            const groceryCount = Math.floor(Math.random() * 8) + 8;
            for (let i = 0; i < groceryCount; i++) {
                transactions.push({
                    user: user._id,
                    wallet: i % 3 === 0 ? gotowka._id : karta._id,
                    category: catZakupy._id,
                    type: 'expense',
                    amount: Math.floor(Math.random() * 150) + 30,
                    date: new Date(currentYear, month, Math.floor(Math.random() * 28) + 1),
                    description: ['Zakupy spożywcze', 'Biedronka', 'Lidl', 'Żabka', 'Kaufland'][Math.floor(Math.random() * 5)]
                });
            }

            // Rozrywka - Restauracje/kawiarnie (3-6 razy w miesiącu)
            const restaurantCount = Math.floor(Math.random() * 4) + 3;
            for (let i = 0; i < restaurantCount; i++) {
                transactions.push({
                    user: user._id,
                    wallet: karta._id,
                    category: catRozrywka._id,
                    type: 'expense',
                    amount: Math.floor(Math.random() * 120) + 30,
                    date: new Date(currentYear, month, Math.floor(Math.random() * 28) + 1),
                    description: ['Restauracja', 'Kawa', 'Lunch', 'Kolacja', 'Pizza'][Math.floor(Math.random() * 5)]
                });
            }

            // Osobiste - Transport
            transactions.push({
                user: user._id,
                wallet: kontoGlowne._id,
                category: catOsobiste._id,
                type: 'expense',
                amount: 100,
                date: new Date(currentYear, month, 3),
                description: 'Bilet miesięczny'
            });

            // Zdrowie - Lekarstwa (co 2-3 miesiące)
            if (month % 3 === 0) {
                transactions.push({
                    user: user._id,
                    wallet: gotowka._id,
                    category: catZdrowie._id,
                    type: 'expense',
                    amount: Math.floor(Math.random() * 100) + 50,
                    date: new Date(currentYear, month, Math.floor(Math.random() * 28) + 1),
                    description: 'Lekarstwa'
                });
            }

            // Osobiste - Kosmetyki
            if (month % 2 === 0) {
                transactions.push({
                    user: user._id,
                    wallet: karta._id,
                    category: catOsobiste._id,
                    type: 'expense',
                    amount: Math.floor(Math.random() * 80) + 40,
                    date: new Date(currentYear, month, Math.floor(Math.random() * 28) + 1),
                    description: 'Kosmetyki i higiena'
                });
            }

            // Rozrywka - Dodatkowe (kino, koncerty, etc.)
            if (Math.random() > 0.4) {
                transactions.push({
                    user: user._id,
                    wallet: karta._id,
                    category: catRozrywka._id,
                    type: 'expense',
                    amount: Math.floor(Math.random() * 150) + 50,
                    date: new Date(currentYear, month, Math.floor(Math.random() * 28) + 1),
                    description: ['Kino', 'Koncert', 'Teatr', 'Netflix', 'Spotify'][Math.floor(Math.random() * 5)]
                });
            }

            // Zakupy - Odzież (co 2-3 miesiące)
            if (month % 3 === 1) {
                transactions.push({
                    user: user._id,
                    wallet: karta._id,
                    category: catZakupy._id,
                    type: 'expense',
                    amount: Math.floor(Math.random() * 300) + 100,
                    date: new Date(currentYear, month, Math.floor(Math.random() * 28) + 1),
                    description: 'Odzież i obuwie'
                });
            }

            // Prezenty (sporadycznie)
            if (month === 1 || month === 11) { // Walentynki i Boże Narodzenie
                transactions.push({
                    user: user._id,
                    wallet: karta._id,
                    category: catPrezenty._id,
                    type: 'expense',
                    amount: Math.floor(Math.random() * 200) + 100,
                    date: new Date(currentYear, month, month === 1 ? 14 : 20),
                    description: month === 1 ? 'Prezent walentynkowy' : 'Prezenty świąteczne'
                });
            }

            // Mieszkanie - Meble/wyposażenie (sporadycznie)
            if (month % 4 === 0 && month > 0) {
                transactions.push({
                    user: user._id,
                    wallet: karta._id,
                    category: catMieszkanie._id,
                    type: 'expense',
                    amount: Math.floor(Math.random() * 400) + 200,
                    date: new Date(currentYear, month, Math.floor(Math.random() * 28) + 1),
                    description: 'Meble i wyposażenie'
                });
            }

            // Samochód - Serwis (co kilka miesięcy)
            if (month === 2 || month === 8) {
                transactions.push({
                    user: user._id,
                    wallet: kontoGlowne._id,
                    category: catSamochod._id,
                    type: 'expense',
                    amount: Math.floor(Math.random() * 500) + 300,
                    date: new Date(currentYear, month, 15),
                    description: 'Serwis samochodowy'
                });
            }

            // Podatki - ZUS (co miesiąc dla przedsiębiorcy)
            if (month > 0) {
                transactions.push({
                    user: user._id,
                    wallet: kontoGlowne._id,
                    category: catPodatki._id,
                    type: 'expense',
                    amount: 650,
                    date: new Date(currentYear, month, 10),
                    description: 'ZUS'
                });
            }

            // Transfer na oszczędności
            transactions.push({
                user: user._id,
                wallet: kontoGlowne._id,
                walletTo: oszczednosci._id,
                type: 'transfer',
                amount: 1000,
                date: new Date(currentYear, month, 2),
                description: 'Oszczędności miesięczne'
            });
        }

        // Dodatkowe duże wydatki w losowych miesiącach
        if (currentMonth >= 3) {
            transactions.push({
                user: user._id,
                wallet: karta._id,
                category: catZakupy._id,
                type: 'expense',
                amount: 3500,
                date: new Date(currentYear, 3, 15),
                description: 'Laptop'
            });
        }

        if (currentMonth >= 5) {
            transactions.push({
                user: user._id,
                wallet: karta._id,
                category: catRozrywka._id,
                type: 'expense',
                amount: 2500,
                date: new Date(currentYear, 5, 10),
                description: 'Wakacje - zaliczka'
            });
        }

        await Transaction.insertMany(transactions);
        console.log(`Utworzono ${transactions.length} transakcji`);

        // 6. Budżety
        console.log('Tworzenie budżetów...');
        await Budget.insertMany([
            {
                user: user._id,
                name: 'Zakupy miesięcznie',
                amount: 1500,
                period: 'monthly',
                categories: [catZakupy._id],
                isActive: true,
                notifyAt: 80
            },
            {
                user: user._id,
                name: 'Rozrywka',
                amount: 500,
                period: 'monthly',
                categories: [catRozrywka._id],
                isActive: true,
                notifyAt: 90
            },
            {
                user: user._id,
                name: 'Samochód',
                amount: 400,
                period: 'monthly',
                categories: [catSamochod._id],
                isActive: true,
                notifyAt: 75
            },
            {
                user: user._id,
                name: 'Rachunki i media',
                amount: 2000,
                period: 'monthly',
                categories: [catRachunki._id],
                isActive: true,
                notifyAt: 80
            }
        ]);

        // 7. Cele
        console.log('Tworzenie celów...');
        await Goal.insertMany([
            {
                user: user._id,
                name: 'Wakacje w Grecji',
                targetAmount: 8000,
                currentAmount: 3500,
                deadline: new Date(now.getFullYear(), 6, 1), // Lipiec
                wallet: oszczednosci._id,
                priority: 'high',
                status: 'active',
                description: 'Dwutygodniowe wakacje na Krecie'
            },
            {
                user: user._id,
                name: 'Nowy laptop',
                targetAmount: 5000,
                currentAmount: 2000,
                deadline: new Date(now.getFullYear(), now.getMonth() + 3, 1),
                priority: 'medium',
                status: 'active',
                description: 'MacBook Pro do pracy'
            },
            {
                user: user._id,
                name: 'Fundusz awaryjny',
                targetAmount: 20000,
                currentAmount: 15000,
                priority: 'high',
                status: 'active',
                description: '6 miesięcy wydatków'
            },
            {
                user: user._id,
                name: 'Rower',
                targetAmount: 3000,
                currentAmount: 3000,
                priority: 'low',
                status: 'completed',
                description: 'Rower górski'
            }
        ]);

        // 8. Aktywa
        console.log('Tworzenie aktywów...');
        await AssetItem.insertMany([
            {
                user: user._id,
                name: 'Mieszkanie',
                type: 'real_estate',
                currentValue: 450000,
                purchasePrice: 380000,
                purchaseDate: new Date(2020, 5, 15),
                currency: 'PLN',
                location: 'Warszawa',
                includeInNetWorth: true,
                description: 'Mieszkanie 50m2'
            },
            {
                user: user._id,
                name: 'Toyota Corolla',
                type: 'vehicle',
                currentValue: 45000,
                purchasePrice: 65000,
                purchaseDate: new Date(2021, 2, 10),
                currency: 'PLN',
                serialNumber: 'WX12345',
                includeInNetWorth: true,
                description: 'Rocznik 2021'
            },
            {
                user: user._id,
                name: 'MacBook Pro',
                type: 'electronics',
                currentValue: 6000,
                purchasePrice: 12000,
                purchaseDate: new Date(2022, 8, 1),
                currency: 'PLN',
                includeInNetWorth: false,
                description: '14" M1 Pro'
            },
            {
                user: user._id,
                name: 'Akcje GPW',
                type: 'investment',
                currentValue: 15000,
                purchasePrice: 12000,
                purchaseDate: new Date(2023, 0, 15),
                currency: 'PLN',
                includeInNetWorth: true,
                description: 'Portfel akcji polskich'
            },
            {
                user: user._id,
                name: 'ETF S&P 500',
                type: 'investment',
                currentValue: 10000,
                purchasePrice: 8500,
                purchaseDate: new Date(2023, 3, 1),
                currency: 'PLN',
                includeInNetWorth: true,
                description: 'Fundusz indeksowy'
            }
        ]);

        console.log('\n========================================');
        console.log('SEED ZAKOŃCZONY POMYŚLNIE!');
        console.log('========================================');
        console.log('\nDane logowania:');
        console.log(`Email: ${userEmail}`);
        console.log('Hasło: Haslo123!');
        console.log('\nUtworzono:');
        console.log(`- Dane dla użytkownika: ${userEmail}`);
        console.log(`- 13 kategorii głównych + 73 podkategorii`);
        console.log(`- ${wallets.length} portfeli`);
        console.log(`- ${transactions.length} transakcji`);
        console.log(`- 4 budżety`);
        console.log(`- 4 cele`);
        console.log(`- 5 aktywów`);
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Błąd seed:', error);
        process.exit(1);
    }
};

seedData();
