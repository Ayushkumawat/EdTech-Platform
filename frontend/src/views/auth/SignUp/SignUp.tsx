import SignUpForm from './SignUpForm'

const SignUp = () => {
    return (
        <div className="relative top-[-10px]">
            <div className="mb-4">
                <h3 className="mb-1">Sign Up</h3>
                <p>And lets get started with your free</p>
            </div>
            <SignUpForm disableSubmit={false} />
        </div>
    )
}

export default SignUp
