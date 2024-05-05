'use client'
import React from 'react';
import { FormEvent, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import { renderSVG } from 'uqr'

export default function Create() {
    const [createMessage, setCreateMessage] = useState<JSX.Element>(<></>)
    const [submitCreateDisabled, setSubmitCreateDisabled] = useState(false)
    const [svgQrCode, setSvgQrCode] = useState<string | null>(null)

    async function onSubmitCreate(event: FormEvent<HTMLFormElement>) {
        setSubmitCreateDisabled(true)
        setCreateMessage(<div className="card text-bg-dark">
            <div className="card-body">
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>)

        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const response = await fetch('/api/coupons', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
        })

        const data = await response.json()
        switch (response.status) {
            case 200:
                const serialNumber = data['serialNumber']
                const readableSerialNumber = `${serialNumber.substring(0, 4)}-${serialNumber.substring(4, 8)}-${serialNumber.substring(8, 12)}`

                const svgQrCode = renderSVG(new URL(`/update?sn=${readableSerialNumber}`, location.href).href)
                setSvgQrCode(svgQrCode)

                setCreateMessage(<div className="card text-bg-success">
                    <div className="card-body">
                        {"シリアル番号: " + readableSerialNumber}
                    </div>
                </div>)

                break
            default:
                setCreateMessage(<div className="card text-bg-danger">
                    <div className="card-body">
                        {data['errorMessage']}
                    </div>
                </div>)
        }
        setSubmitCreateDisabled(false)
    }

    const downloadQrCode = async (svgQrCode: string) => {
        // SVG の URL を生成
        const svgQrcodeUrl = URL.createObjectURL(new Blob([svgQrCode], {
            type: 'image/svg+xml'
        }))
        // SVG の HTMLImageElement を作成
        const svgQrcodeImage = await new Promise<HTMLImageElement>(resolve => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.src = svgQrcodeUrl
        })

        // png に変換
        const containerRectElement = new DOMParser().parseFromString(svgQrCode, 'image/svg+xml').querySelector('rect')
        if (!containerRectElement) {
            return
        }
        const canvas = document.createElement('canvas')
        canvas.hidden = true
        canvas.width = containerRectElement.width.baseVal.value
        canvas.height = containerRectElement.height.baseVal.value
        document.body.append(canvas)
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(svgQrcodeImage, 0, 0)
        const targetUrl = canvas.toDataURL('image/png')

        // ダウンロード
        const downloadLink = document.createElement('a')
        downloadLink.href = targetUrl
        downloadLink.download = `qrcode.png`
        downloadLink.click()

        // 後始末
        canvas.remove()
        svgQrcodeImage.remove()
        downloadLink.remove()
    }
    return (
        <>
            <div className="flex items-center h-[100dvh]">
                <div className="container">
                    <h1>券発行フォーム</h1>
                    <form className="needs-validation" onSubmit={onSubmitCreate}>
                        <div className="form-floating mb-3">
                            <input className="form-control form-control-lg" type="text" id="text" name="text" required minLength={1} maxLength={10} />
                            <label className="form-label" htmlFor="text">券名</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input className="form-control form-control-lg" type="date" id="expiredAt" name="expiredAt" />
                            <label className="form-label" htmlFor="expiredAt">有効期限</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input className="form-control form-control-lg" type="number" id="passCode" name="passCode" required minLength={5} maxLength={5} />
                            <label className="form-label" htmlFor="passCode">パスコード</label>
                        </div>
                        <button className="btn btn-primary btn-lg mb-3" type="submit" disabled={submitCreateDisabled}>発行する</button>
                    </form>
                    {createMessage}
                    {
                        svgQrCode && <div className="grid grid-cols-1 md:grid-cols-2 place-items-center my-2 gap-2">
                            <div dangerouslySetInnerHTML={{ __html: svgQrCode }} className="w-32 h-32" />
                            <button onClick={() => downloadQrCode(svgQrCode)} className="btn btn-primary">
                                QRコードをダウンロード
                            </button>
                        </div>
                    }
                </div>
            </div>
        </>
    )
}
