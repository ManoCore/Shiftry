// utils/sendTokenResponse.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_COOKIE_EXPIRE_DAYS = process.env.JWT_COOKIE_EXPIRE_DAYS || 7;

const sendTokenResponse = (user, statusCode, res, organization) => { // <--- organization parameter added
    if (!organization || !organization._id || !organization.name) {
        console.error("sendTokenResponse: Organization object is missing or incomplete.", organization);
        return res.status(500).json({ success: false, message: "Internal server error: Organization data missing for token generation." });
    }

    const token = jwt.sign(
        {
            userId: user._id,
            emailId: user.emailId,
            role: user.role,
            organizationId: organization._id.toString(), // <--- ADDED to JWT payload
            organizationName: organization.name,        // <--- ADDED to JWT payload
        },
        JWT_SECRET,
        { expiresIn: `${JWT_COOKIE_EXPIRE_DAYS}d` }
    );

    const options = {
        expires: new Date(Date.now() + JWT_COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        // sameSite: 'Lax',
    };

    const userResponse = { ...user.toObject() };
    delete userResponse.passwordHash;

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token,
        data: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            emailId: user.emailId,
            role: user.role,
            profilePicture: user.profilePicture,
            organization: { // <--- ADDED to response data
                _id: organization._id,
                name: organization.name,
            },
        },
    });
};

module.exports = { sendTokenResponse };