import { IdentifiableCart } from "common/types";
import { connection } from ".";
import { getConfig } from "../config";
import { v4 as uuid } from "uuid";
import { signJWT } from "../../util/jwt";
import { AuthorizationPayload, BitsTransactionPayload } from "../../types";

export enum StressTestType {
    GameSpawnQueue,
    GameUnsentQueue,
    TransactionSpam,
}

export type StressTestRequest = {
    type: StressTestType;
    duration: number;
    interval: number;
}

let inStressTest: boolean = false;

export function isStressTesting(): boolean {
    return inStressTest;
}

let activeInterval: number;

export async function startStressTest(type: StressTestType, duration: number, interval: number) {
    console.log(`Starting stress test ${StressTestType[type]} for ${duration}ms`)
    switch (type) {
        case StressTestType.GameSpawnQueue:
            activeInterval = +setInterval(() => sendSpawnRedeem().then(), interval);
            break;
        case StressTestType.GameUnsentQueue:
            connection.stressTestSetHandshake(false);
            const count = Math.floor(duration / interval);
            console.log(`Sending ${count} spawns...`);
            for (let i = 0; i < count; i++) {
                sendSpawnRedeem().then().catch(e => e);
            }
            break;
        case StressTestType.TransactionSpam:
            activeInterval = +setInterval(() => sendTransaction().then(), interval);
            break;
    }
    inStressTest = true;
    setTimeout(() => {
        inStressTest = false;
        if (type === StressTestType.GameUnsentQueue)
            connection.stressTestSetHandshake(true);
        return clearInterval(activeInterval);
    }, duration);
}

const redeemId: string = "spawn_passive";
const user = {
    id: "stress",
    login: "stresstest",
    displayName: "Stress Test",
};
const cart: IdentifiableCart = {
    userId: "stress",
    version: 1,
    id: redeemId,
    sku: "bits1",
    args: {
        "creature": "0",
        "behind": false,
    }
};
async function sendSpawnRedeem() {
    const config = await getConfig();
    const redeem = config.redeems![redeemId];
    
    connection.redeem(redeem, cart, user, uuid()).then().catch(err => {
        console.log(err);
    });
}

const invalidAuth: AuthorizationPayload = {
    channel_id: "stress",
    exp: Date.now() + 1000,
    is_unlinked: false,
    opaque_user_id: "Ustress",
    pubsub_perms: {
        listen: [],
        send: [],
    },
    role: "viewer",
};
const validAuth: AuthorizationPayload = {
    ...invalidAuth,
    user_id: "stress",
}
const signedValidJWT = signJWT(validAuth);
const signedInvalidJWT = signJWT(invalidAuth);
const invalidJWT = "trust me bro";

async function sendTransaction() {
    // we have to go through the http flow because the handler is scuffed
    // and we need to stress the logging webhook as well
    const urlPrepurchase = "http://localhost:3000/public/prepurchase";
    const urlTransaction = "http://localhost:3000/public/transaction";

    const jwtChoice = Math.floor(3*Math.random());
    const token = jwtChoice == 0 ? signedValidJWT
        : jwtChoice == 1 ? signedInvalidJWT
        : invalidJWT;
    const auth = `Bearer ${token}`;
    console.log(`Prepurchasing with ${jwtChoice == 0 ? "signed valid" : jwtChoice == 1 ? "signed invalid" : "unsigned invalid"} JWT`);
    
    const prepurchase = await fetch(urlPrepurchase, {
        method: "POST",
        headers: {
            "Authorization": auth,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(cart),
    });
    switch (jwtChoice) {
        case 0:
            if (!prepurchase.ok)
                console.error("Valid JWT should have succeeded");
            break;
        case 1:
            if (prepurchase.ok)
                console.error("JWT without user ID should have failed");
            break;
        case 2:
            if (prepurchase.ok)
                console.error("Invalid bearer token should have failed");
            break;
    }
    const transactionId = await prepurchase.text();

    const receipt: BitsTransactionPayload = {
        exp: Date.now() + 1000,
        topic: "topic",
        data: {
            transactionId,
            product: {
                sku: "bits1",
                cost: {
                    amount: 1,
                    type: "bits"
                },
                displayName: "",
                domainId: ""
            },
            userId: "stress",
            time: "time"
        }
    };

    console.log(`Sending transaction (${jwtChoice})`);
    const transaction = await fetch(urlTransaction, {
        method: "POST",
        headers: {
            "Authorization": auth,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: transactionId,
            receipt: signJWT(receipt),
        }),
    });
    switch (jwtChoice) {
        case 0:
            if (prepurchase.ok && !transaction.ok)
                console.error("Valid JWT should have succeeded");
            break;
        case 1:
            if (transaction.ok)
                console.error("JWT without user ID should have failed");
            break;
        case 2:
            if (transaction.ok)
                console.error("Invalid bearer token should have failed");
            break;
    }
}
