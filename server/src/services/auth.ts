import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { PRIVATE_KEY } from '../config';

export type Token = string;

const expTime = () => 1000 * 60 * 60 * 24;
const tokenField = 'token';
const adminLabel = 'admin';


function createJWT(payload: jwt.JwtPayload, jwtOptions: jwt.SignOptions = { expiresIn: expTime() / 1000 }): Token {
    return jwt.sign(payload, PRIVATE_KEY, jwtOptions);
}

function decodeJWT(token: Token): jwt.JwtPayload {
    let payload = null;
    jwt.verify(token, PRIVATE_KEY, (err, decoded) => {
        if (!err) payload = decoded;
    });
    return payload;
}



export function adminOnly(req: Request, res: Response, next: NextFunction): void {
    const tokenPayload = decodeJWT(req.headers[tokenField] as string);
    
    if (tokenPayload?.sub === adminLabel) {
        // Valid admin token
        next();
    } else {
        // Invalid token
        res.sendStatus(401);
    } 
}

export function admindOnlySocket(socket: Socket, next: Function) {
    const tokenPayload = decodeJWT(socket.handshake.auth.token);

    if (tokenPayload?.sub === adminLabel) {
        // Valid admin token
        next();
    } else {
        // Invalid token
        next(new Error("invalid session"));
        
        // socket.conn.close();
    }
}

export function createAdminToken(): string {
    const expirationTime = expTime();
    return createJWT({ sub: adminLabel }, { expiresIn: expirationTime / 1000 });
}