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

        // Wyczyść bazę
        console.log('Czyszczenie bazy danych...');
        await User.deleteMany({});
        await Category.deleteMany({});
        await Wallet.deleteMany({});
        await Transaction.deleteMany({});
        await Budget.deleteMany({});
        await Goal.deleteMany({});
        await AssetItem.deleteMany({});

        // 1. Użytkownik testowy
        console.log('Tworzenie użytkownika...');
        const user = await User.create({
            email: 'test@example.com',
            password: 'Test123!@#',
            name: 'Jan Kowalski',
            currency: 'PLN',
            settings: {
                notifications: true,
                darkMode: false,
                language: 'pl'
            }
        });
        console.log(`Użytkownik: test@example.com / Test123!@#`);

        // 2. Kategorie wydatków
        console.log('Tworzenie kategorii...');
        const expenseCategories = await Category.insertMany([
            { user: user._id, name: 'Jedzenie', type: 'expense', color: '#FF6B6B', icon: 'utensils', order: 1 },
            { user: user._id, name: 'Transport', type: 'expense', color: '#4ECDC4', icon: 'car', order: 2 },
            { user: user._id, name: 'Rozrywka', type: 'expense', color: '#45B7D1', icon: 'gamepad', order: 3 },
            { user: user._id, name: 'Zakupy', type: 'expense', color: '#96CEB4', icon: 'shopping-bag', order: 4 },
            { user: user._id, name: 'Rachunki', type: 'expense', color: '#FFEAA7', icon: 'file-invoice', order: 5 },
            { user: user._id, name: 'Zdrowie', type: 'expense', color: '#DDA0DD', icon: 'heartbeat', order: 6 },
            { user: user._id, name: 'Edukacja', type: 'expense', color: '#98D8C8', icon: 'book', order: 7 },
            { user: user._id, name: 'Mieszkanie', type: 'expense', color: '#F7DC6F', icon: 'home', order: 8 },
            { user: user._id, name: 'Ubrania', type: 'expense', color: '#BB8FCE', icon: 'tshirt', order: 9 },
            { user: user._id, name: 'Inne wydatki', type: 'expense', color: '#85C1E9', icon: 'ellipsis-h', order: 10 }
        ]);

        // 3. Kategorie przychodów
        const incomeCategories = await Category.insertMany([
            { user: user._id, name: 'Wynagrodzenie', type: 'income', color: '#2ECC71', icon: 'briefcase', order: 1 },
            { user: user._id, name: 'Freelance', type: 'income', color: '#3498DB', icon: 'laptop', order: 2 },
            { user: user._id, name: 'Inwestycje', type: 'income', color: '#9B59B6', icon: 'chart-line', order: 3 },
            { user: user._id, name: 'Prezenty', type: 'income', color: '#E74C3C', icon: 'gift', order: 4 },
            { user: user._id, name: 'Zwroty', type: 'income', color: '#1ABC9C', icon: 'undo', order: 5 },
            { user: user._id, name: 'Inne przychody', type: 'income', color: '#F39C12', icon: 'plus-circle', order: 6 }
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

        // 5. Transakcje (ostatnie 30 dni)
        console.log('Tworzenie transakcji...');
        const transactions = [];
        const now = new Date();

        // Wynagrodzenie
        transactions.push({
            user: user._id,
            wallet: kontoGlowne._id,
            category: incomeCategories[0]._id, // Wynagrodzenie
            type: 'income',
            amount: 8500,
            date: new Date(now.getFullYear(), now.getMonth(), 1),
            description: 'Wypłata za miesiąc'
        });

        // Freelance
        transactions.push({
            user: user._id,
            wallet: kontoGlowne._id,
            category: incomeCategories[1]._id, // Freelance
            type: 'income',
            amount: 2000,
            date: new Date(now.getFullYear(), now.getMonth(), 15),
            description: 'Projekt dla klienta'
        });

        // Wydatki - Jedzenie
        for (let i = 0; i < 12; i++) {
            transactions.push({
                user: user._id,
                wallet: i % 3 === 0 ? gotowka._id : karta._id,
                category: expenseCategories[0]._id, // Jedzenie
                type: 'expense',
                amount: Math.floor(Math.random() * 100) + 20,
                date: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                description: ['Zakupy spożywcze', 'Restauracja', 'Kawa', 'Lunch'][Math.floor(Math.random() * 4)]
            });
        }

        // Wydatki - Transport
        transactions.push({
            user: user._id,
            wallet: kontoGlowne._id,
            category: expenseCategories[1]._id, // Transport
            type: 'expense',
            amount: 150,
            date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            description: 'Paliwo'
        });
        transactions.push({
            user: user._id,
            wallet: kontoGlowne._id,
            category: expenseCategories[1]._id,
            type: 'expense',
            amount: 100,
            date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
            description: 'Bilet miesięczny'
        });

        // Wydatki - Rozrywka
        transactions.push({
            user: user._id,
            wallet: karta._id,
            category: expenseCategories[2]._id, // Rozrywka
            type: 'expense',
            amount: 60,
            date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            description: 'Kino'
        });
        transactions.push({
            user: user._id,
            wallet: karta._id,
            category: expenseCategories[2]._id,
            type: 'expense',
            amount: 150,
            date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            description: 'Koncert'
        });

        // Wydatki - Rachunki
        transactions.push({
            user: user._id,
            wallet: kontoGlowne._id,
            category: expenseCategories[4]._id, // Rachunki
            type: 'expense',
            amount: 1500,
            date: new Date(now.getFullYear(), now.getMonth(), 5),
            description: 'Czynsz'
        });
        transactions.push({
            user: user._id,
            wallet: kontoGlowne._id,
            category: expenseCategories[4]._id,
            type: 'expense',
            amount: 200,
            date: new Date(now.getFullYear(), now.getMonth(), 10),
            description: 'Prąd'
        });
        transactions.push({
            user: user._id,
            wallet: kontoGlowne._id,
            category: expenseCategories[4]._id,
            type: 'expense',
            amount: 80,
            date: new Date(now.getFullYear(), now.getMonth(), 10),
            description: 'Internet'
        });

        // Wydatki - Zakupy
        transactions.push({
            user: user._id,
            wallet: karta._id,
            category: expenseCategories[3]._id, // Zakupy
            type: 'expense',
            amount: 350,
            date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            description: 'Elektronika'
        });

        // Transfer na oszczędności
        transactions.push({
            user: user._id,
            wallet: kontoGlowne._id,
            walletTo: oszczednosci._id,
            type: 'transfer',
            amount: 1000,
            date: new Date(now.getFullYear(), now.getMonth(), 2),
            description: 'Oszczędności miesięczne'
        });

        await Transaction.insertMany(transactions);
        console.log(`Utworzono ${transactions.length} transakcji`);

        // 6. Budżety
        console.log('Tworzenie budżetów...');
        await Budget.insertMany([
            {
                user: user._id,
                name: 'Jedzenie miesięcznie',
                amount: 1500,
                period: 'monthly',
                categories: [expenseCategories[0]._id],
                isActive: true,
                notifyAt: 80
            },
            {
                user: user._id,
                name: 'Rozrywka',
                amount: 500,
                period: 'monthly',
                categories: [expenseCategories[2]._id],
                isActive: true,
                notifyAt: 90
            },
            {
                user: user._id,
                name: 'Transport',
                amount: 400,
                period: 'monthly',
                categories: [expenseCategories[1]._id],
                isActive: true,
                notifyAt: 75
            },
            {
                user: user._id,
                name: 'Zakupy tygodniowe',
                amount: 300,
                period: 'weekly',
                categories: [expenseCategories[3]._id],
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
        console.log('Email: test@example.com');
        console.log('Hasło: Test123!@#');
        console.log('\nUtworzono:');
        console.log(`- 1 użytkownik`);
        console.log(`- ${expenseCategories.length + incomeCategories.length} kategorii`);
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
