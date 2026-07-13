export type PaymentMethod = "CHAPA" | "TELEBIRR" | "STARPAY" | "CASH" | "BANK_TRANSFER";
export type GatewayStatus = "LIVE" | "PAUSED";

export interface PaymentMethodOption {
    method: PaymentMethod;
    label: string;
    toggleable: boolean;
    status: GatewayStatus;
}

export interface PaymentMethodsResponse {
    success: boolean;
    data: {
        methods: PaymentMethodOption[];
    };
}

export interface UpdateGatewayStatusResponse {
    success: boolean;
    data: {
        method: PaymentMethod;
        status: GatewayStatus;
    };
}
