'use client'
import React from 'react';
import {FormEvent, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'

export default function Create() {
    const [createMessage, setCreateMessage] = useState<JSX.Element>(<></>)
    const [submitCreateDisabled, setSubmitCreateDisabled] = useState(false)

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
                setCreateMessage(<div className="card text-bg-success">
                    <div className="card-body">
                        {"シリアル番号: " + `${serialNumber.substring(0, 4)}-${serialNumber.substring(4, 8)}-${serialNumber.substring(8, 12)}`}
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

    return (
        <div className="container">
            <h1>券発行フォーム</h1>
            <form className="needs-validation" onSubmit={onSubmitCreate}>
                <div className="form-floating mb-3">
                    <input className="form-control form-control-lg" type="number" id="number" name="number" required minLength={1} maxLength={10}/>
                    <label className="form-label" htmlFor="number">回数</label>
                </div>
                <div className="form-floating mb-3">
                    <input className="form-control form-control-lg" type="date" id="expiredAt" name="expiredAt"/>
                    <label className="form-label" htmlFor="expiredAt">有効期限</label>
                </div>
                <div className="form-floating mb-3">
                    <input className="form-control form-control-lg" type="number" id="passCode" name="passCode" required minLength={5} maxLength={5}/>
                    <label className="form-label" htmlFor="passCode">パスコード</label>
                </div>
                <button className="btn btn-primary btn-lg mb-3" type="submit" disabled={submitCreateDisabled}>発行する</button>
            </form>
            {createMessage}
        </div>
    )
}
