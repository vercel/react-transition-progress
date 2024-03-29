export default async function Page() {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return <>
        <h1>Slow page</h1>
    </>
}