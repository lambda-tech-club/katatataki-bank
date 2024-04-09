import sha256 from 'crypto-js/sha256';
import {kv} from "@vercel/kv";
import {NextRequest, NextResponse} from "next/server";

function hashSerialNumber(serialNumber: string, passCode: string) : string {
    return serialNumber + sha256(`${passCode}:${process.env.SALT}`);
}

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

export async function POST(
    req: NextRequest
) {
    const data = await req.json()
    // Validation
    const number = data['number']
    if (!number || number.toString() === '0' || number.toString().length <= 0 || number.toString().length >= 6 || !/^[0-9]+$/.test(number.toString())) {
        return NextResponse.json({
            'errorMessage': "回数は1回以上99999回以下にしてください"
        }, { status: 400 })
    }

    const expiredAt = data['expiredAt']
    if (expiredAt && (expiredAt.toString().length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(expiredAt))) {
        return NextResponse.json({
            'errorMessage': "有効期限はyyyy-mm-dd形式で入力してください"
        }, { status: 400 })
    }

    const passCode = data['passCode']
    if (!passCode || passCode.toString().length !== 5 || !/^[0-9]+$/.test(passCode.toString())) {
        return NextResponse.json({
            'errorMessage': "パスコードは5桁の数字で入力してください"
        }, { status: 400 })
    }

    let key = generateId()
    // すでに存在するかチェック
    let found = await kv.get(key)
    while (!!found) {
        key = generateId()
        found = await kv.get(key)
    }

    const createResponse = await kv.set(
        key,
        {
            hash: hashSerialNumber(key, passCode),
            expiredAt: expiredAt ? new Date(expiredAt).getTime() : null,
            number: number,
        }
    )
    if (createResponse !== "OK") {
        NextResponse.json({
            'errorMessage': "何らかの理由で発行に失敗しました"
        }, { status: 500 })
    }

    return NextResponse.json({ 'serialNumber': key }, { status: 200 })
}

export async function PUT(
    req: NextRequest
) {
    const data = await req.json()

    // Validation
    const serialNumber = data['serialNumber']
    if (!serialNumber || serialNumber.toString().length !== 12 || !/^[0-9]+$/.test(serialNumber.toString())) {
        return NextResponse.json({
            'errorMessage': "シリアル番号は12桁の数字で入力してください"
        }, { status: 400 })
    }

    const passCode = data['passCode']
    if (!passCode || passCode.toString().length !== 5 || !/^[0-9]+$/.test(passCode.toString())) {
        return NextResponse.json({
            'errorMessage': "パスコードは5桁の数字で入力してください"
        }, { status: 400 })
    }

    const found = JSON.parse(JSON.stringify(await kv.get(serialNumber)))
    if (!found) {
        return NextResponse.json({
            'errorMessage': "無効なシリアル番号です"
        }, { status: 404 })
    }

    const hash = hashSerialNumber(serialNumber, passCode);
    if (found['hash'] !== hash) {
        return NextResponse.json({
            "errorMessage": "パスコードが違います"
        }, { status: 403 })
    }

    if (!!found['usedAt']) {
        return NextResponse.json({
            'message': "この券は既に利用されています"
        }, { status: 200 })
    }

    const now = new Date().getTime()
    const foundExpiredAt = found['expiredAt']
    if (!!foundExpiredAt && now > found['expiredAt']) {
        return NextResponse.json({
            'message': "この券は有効期限が切れています"
        }, { status: 200 })
    }

    const updateResponse = await kv.set(
        serialNumber,
        {
            ...found,
            usedAt: new Date().toISOString()
        }
    )

    if (updateResponse !== "OK") {
        NextResponse.json({
            'errorMessage': "何らかの理由で確認に失敗しました"
        }, { status: 500 })
    }

    return NextResponse.json({
        'message': `${found['number']}回券が正常に利用されました`
    }, { status: 200 })
}