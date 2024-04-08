'use client'
import React from 'react';
import {FormEvent, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'

export default function All() {
    const [updateMessage, setUpdateMessage] = useState<JSX.Element>(<></>)
    const [submitUpdateDisabled, setSubmitUpdateDisabled] = useState(false)

    async function onSubmitUpdate(event: FormEvent<HTMLFormElement>) {
        setSubmitUpdateDisabled(true)
        setUpdateMessage(<div className="card text-bg-dark">
            <div className="card-body">
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>)

        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const response = await fetch('/api/coupons', {
            method: 'PUT',
            body: JSON.stringify(Object.fromEntries(formData)),
        })

        switch (response.status) {
            case 200:
                const data = await response.json()
                setUpdateMessage(<div className="card text-bg-dark">
                <div className="card-body">
                    {data['message']}
                </div>
            </div>)
                break
            case 400:
                setUpdateMessage(<div className="card text-bg-danger">
                <div className="card-body">
                    無効なシリアル番号です
                </div>
            </div>)
                break
            case 403:
                setUpdateMessage(<div className="card text-bg-danger">
                <div className="card-body">
                    パスコードが違います
                </div>
            </div>)
                break
            default:
                setUpdateMessage(<div className="card text-bg-warning">
                <div className="card-body">
                    何らかの理由で失敗しました
                </div>
            </div>)
        }
        setSubmitUpdateDisabled(false)
    }

    return (
        <div className="container">
            <h1>券を利用する</h1>
            <form onSubmit={onSubmitUpdate}>
                <div className="form-floating mb-3">
                    <input className="form-control form-control-lg" type="number" id="couponCode" name="number" required minLength={12} maxLength={12}/>
                    <label className="form-label" htmlFor="couponCode">シリアル番号</label>
                </div>
                <div className="form-floating mb-3">
                    <input className="form-control form-control-lg" type="number" id="watchWord" name="watchWord" required minLength={5} maxLength={5}/>
                    <label className="form-label" htmlFor="watchWord">パスコード</label>
                </div>
                <button className="btn btn-primary btn-lg mb-3" type="submit" disabled={submitUpdateDisabled}>利用する</button>
            </form>
            {updateMessage}
        </div>
    )
}
