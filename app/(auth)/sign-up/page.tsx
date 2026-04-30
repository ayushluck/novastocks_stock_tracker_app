'use client';
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form"
import InputFields from "@/components/forms/InputFields";
import CountrySelect from "@/components/forms/CountrySelect";
import SelectField from "@/components/forms/SelectField";
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants";
import FooterLink from "@/components/forms/FooterLink";
import { signUpWithEmail } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
const SignUp = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            country: '',
            investmentGoals: '',
            riskTolerance: '',
            preferredIndustry: ''
        },
        mode: 'onBlur'
    },);

    const onSubmit = async (data: SignUpFormData) => {
        try {
            const result = await signUpWithEmail(data);
            if (result.success) {
                window.location.assign('/');
            }
        } catch (e) {
            console.error(e);
            toast.error('Sign up failed', {
                description: e instanceof Error ? e.message : "Failed to create a Account"
            })
        }
    };

    return (
        <>
            <h1 className="form-title text-5xl md:text-6xl mb-12 leading-none">Sign Up & Personalize</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <InputFields
                    name="fullName"
                    label="Full Name"
                    placeholder="Enter Your Name"
                    register={register}
                    error={errors.fullName}
                    validation={{ required: "Full Name is Required", minLength: 2 }}
                />
                <InputFields
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="Enter Your Email"
                    register={register}
                    error={errors.email}
                    validation={{ required: "Email is Required", pattern: { value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, message: "Invalid Email Address" } }}
                />
                <InputFields
                    name="password"
                    label="Password"
                    placeholder="Enter Your Password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{
                        required: "Password is Required",
                        minLength: { value: 8, message: "Password must be at least 8 characters" }
                    }}
                />
                <Controller
                    name="country"
                    control={control}
                    rules={{ required: "Country is Required" }}
                    render={({ field }) => (
                        <CountrySelect
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.country?.message as string}
                            disabled={isSubmitting}
                        />
                    )}
                />
                <SelectField
                    name="investmentGoals"
                    label="Investment Goals"
                    placeholder="Select Your Investment Goals"
                    options={INVESTMENT_GOALS}
                    error={errors.investmentGoals}
                    control={control}
                    required
                />
                <SelectField
                    name="riskTolerance"
                    label="Risk Tolerance"
                    placeholder="Select Your Risk Tolerance"
                    options={RISK_TOLERANCE_OPTIONS}
                    error={errors.riskTolerance}
                    control={control}
                    required
                />
                <SelectField
                    name="preferredIndustry"
                    label="Preferred Industry"
                    placeholder="Select Your Preferred Industry"
                    options={PREFERRED_INDUSTRIES}
                    error={errors.preferredIndustry}
                    control={control}
                    required
                />
                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-6 text-lg h-14">
                    {isSubmitting ? 'Creating Account...' : 'Start Your Investment Journey'}
                </Button>
                <FooterLink text="Already Have a Account?" linkText="Sign-In" href="/sign-in" />
            </form>
        </>
    );
};

export default SignUp