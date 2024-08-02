let transactions = []


function createTransactionContainer(id) {
    const container = document.createElement("div")
    container.classList.add('transaction')
    container.id = `transactions-${id}`
    return container
}

function createTransactionTitle(name) {
    const title = document.createElement('span')
    title.classList.add('transaction-title')
    title.textContent = name
    return title
}

function createTransactionAmount(amount) {
    const span = document.createElement('span')
    const formatter = Intl.NumberFormat('pt-BR', {
        compactDisplay: 'long',
        currency: 'BRL',
        style: 'currency'
    })
    const formattedAmount = formatter.format(amount)

    if (amount > 0) {    
        span.textContent = `${formattedAmount} C`
        span.classList.add('credit')
    } else {
        span.textContent = `${formattedAmount} D`
        span.classList.add('debit')

    }
    return span
}

function renderTransaction(transaction) {
    const container = createTransactionContainer(transaction.id)
    const title = createTransactionTitle(transaction.name)
    const amount = createTransactionAmount(transaction.amount)
    const editBtn = createEditTransactionBtn(transaction)
    const removeBtn = createDeleteTransactionsBtn(transaction.id)

    container.append(title, amount, editBtn, removeBtn)
    document.querySelector('#transactions').append(container)
}

async function fetchTransactions() {
    return await fetch('http://localhost:3000/transactions').then(res => res.json())
}

async function setup() {
    const results = await fetchTransactions()
    transactions.push(...results)
    transactions.forEach(renderTransaction)
}

document.addEventListener('DOMContentLoaded', setup)

function updateBalance() {
    const balanceSpan = document.querySelector('#balance')
    const balance = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
    const formatter = Intl.NumberFormat("pt-BR", {
        currency: 'BRL',
        compactDisplay: 'long',
        style: 'currency'
    })
    balanceSpan.textContent = formatter.format(balance)
}

async function setup() {
    const results = await fetchTransactions()
    transactions.push(...results)
    transactions.forEach(renderTransaction)
    updateBalance()
}

async function saveTransaction(ev) {
    ev.preventDefault()
    
    
    const name = document.querySelector('#name').value
    const amount = parseFloat(document.querySelector('#amount').value)
    const id = document.querySelector('#id').value
    if(id) {
        const response = await fetch(`http://localhost:3000/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify({name, amount}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const transaction = await response.json()
        const idxToRemove = transactions.findIndex((t) => t.id === id)
        transactions.splice(idxToRemove, 1, transaction)
        document.querySelector(`#transactions-${id}`).remove()
        renderTransaction(transaction)
    } else {
        const response = await fetch('http://localhost:3000/transactions', {
            method: 'POST',
            body: JSON.stringify({ name, amount }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    
        const transaction = await response.json()
        transactions.push(transaction)
        renderTransaction(transaction)
    }

    ev.target.reset()
    updateBalance()
}

document.addEventListener('DOMContentLoaded', setup)
document.querySelector('form').addEventListener('submit', saveTransaction)

function createEditTransactionBtn(transaction) {
    const editBtn = document.createElement('button')
    editBtn.classList.add('edit-btn')
    editBtn.textContent = 'Editar'
    editBtn.addEventListener('click', () => {
        document.querySelector('#id').value = transaction.id
        document.querySelector('#name').value = transaction.name
        document.querySelector('#amount').value = transaction.amount
    })
    return editBtn
}

function createDeleteTransactionsBtn(id) {
    const deleteBtn = document.createElement('button')
    deleteBtn.classList.add('delete-btn')
    deleteBtn.textContent = 'Excluir'
    deleteBtn.addEventListener('click', async () => {
        await fetch(`http://localhost:3000/transactions/${id}`, { method: 'DELETE'})
        deleteBtn.parentElement.remove()
        const idxToRemove = transactions.findIndex((t) => t.id === id)
        transactions.splice(idxToRemove, 1)
        updateBalance()
    })
    return deleteBtn
}







