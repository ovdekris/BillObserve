const errorHandler = (err, req, res) => {
    let error = { ...err };
    error.message = err.message;

    //Log dla developera
    if(process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // Mongoose - błędne ObjectId
    if (err.name === 'CastError') {
        error.message = 'Nie znaleziono zasobów';
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }

    // Mongoose - duplikat klucza
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error.message = `${field} już istnieje`;
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    // Mongoose - błędy walidacji
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            message: 'Błąd walidacji',
            errors: messages
        });
    }

    // JWT - token wygasł
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token wygasł, zaloguj się ponownie'
        });
    }

    // JWT - nieprawidłowy token
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Nieprawidłowy token'
        });
    }

    // Domyślny błąd
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Błąd serwera'
    });
};

module.exports = errorHandler;
