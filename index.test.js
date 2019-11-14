const supertest = require("supertest");
const app = require("./index");
const cookieSession = require("cookie-session");

test("GET /petition redirects to registration if logged out", () => {
    return supertest(app)
        .get("/petition")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/register");
        });
});

test("GET /register to redirect to /petition when logged in", () => {
    cookieSession.mockSessionOnce({
        userId: 1
    });
    return supertest(app)
        .get("/register")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

test("GET /login to redirect to /petition when logged in", () => {
    cookieSession.mockSessionOnce({
        userId: 1
    });
    return supertest(app)
        .get("/login")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});
