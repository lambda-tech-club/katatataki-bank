import sha256 from 'crypto-js/sha256';
import {kv} from "@vercel/kv";
import {NextRequest, NextResponse} from "next/server";

function hashCouponCode(couponCode: string, watchWord: string) : string {
    return couponCode + sha256(`${watchWord}:${process.env.SALT}`);
}

export async function POST(
    req: NextRequest
) {
    function generateId() {
        let key = '';
        const length = 12;
        const characters = '0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            key += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return key;
    }

    let key = generateId()
    // すでに存在するかチェック
    let found = await kv.get(key)
    while (!!found) {
        console.log("here")
        key = generateId()
        found = await kv.get(key)
    }

    const data = await req.json()
    const createResponse = await kv.set(
        key,
        {
            hash: hashCouponCode(key, data['watchWord']),
            expiredAt: data['expiredAt'] ? new Date(data['expiredAt']).getTime() : null,
            number: data['number'],
        }
    )
    if (createResponse !== "OK") {
        NextResponse.json({}, { status: 500 })
    }

    return NextResponse.json({ 'couponCode': key }, { status: 200 })
}

export async function PUT(
    req: NextRequest
) {
    const data = await req.json()
    const couponCode = data['couponCode']
    const found =JSON.parse(JSON.stringify(await kv.get(couponCode)))
    if (!found) {
        return NextResponse.json({}, { status: 400 })
    }

    const hash = hashCouponCode(couponCode, data['watchWord']);
    if (found['hash'] !== hash) {
        return NextResponse.json({}, { status: 403 })
    }

    if (!!found['usedAt']) {
        return NextResponse.json({
            message: "既に利用されています"
        }, { status: 200 })
    }

    const now = new Date().getTime()
    const foundExpiredAt = found['expiredAt']
    if (!!foundExpiredAt && now > found['expiredAt']) {
        return NextResponse.json({
            message: "利用期限が切れています"
        }, { status: 200 })
    }

    const updateResponse = await kv.set(
        couponCode,
        {
            ...found,
            usedAt: new Date().toISOString()
        }
    )

    if (updateResponse !== "OK") {
        NextResponse.json({
            'message': "Failed to update your tataki-ken"
        }, {
            status: 500,
        })
    }

    return NextResponse.json({
        'message': "正常に券が利用されました"
    }, { status: 200 })
}