import { FieldGroup, FieldSet, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";


const NewCertificazionePage = () => {
    return (
        <div className="flex flex-row gap-4 bg-white p-4 rounded-lg shadow-lg w-auto m-4">
            <FieldSet className="flex-1">
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="name">Full name</FieldLabel>
                        <Input id="name" autoComplete="off" placeholder="Evil Rabbit" />
                    </Field>
                </FieldGroup>
            </FieldSet>
            <FieldSet className="flex-1">
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="name">Full name</FieldLabel>
                        <Input id="name" autoComplete="off" placeholder="Evil Rabbit" />
                    </Field>
                </FieldGroup>
            </FieldSet>
        </div>
    );
};

export default NewCertificazionePage;
