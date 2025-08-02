
export type THasNext = boolean | undefined | null;

export interface IPatient {
    patient_id?: string;
    name?: string;
    age?: number;
    gender?: 'M' | 'F';
    blood_pressure?: string;
    temperature?: number;
    visit_date?: string;
    diagnosis?: string;
    medications?: string;
}

export interface IValidResponse {
    data?: {
        data?: IPatient[];
        pagination?: {
            page?: number;
            limits?: number;
            total?: number;
            totalPages?: number;
            hasNext?: boolean;
            hasPrevious?: boolean;
        };
        metadata?: {
            timestamp?: string;
            version?: string;
            requestId?: string;
        }
    };
}

export type TResponse = IValidResponse | undefined | null;

export interface IEvaluation {
    riskScore: number;
    bloodPressureRisk: boolean;
    ageRisk: boolean;
    qualityIssues: boolean;
    systolic: number;
    diastolic: number;
}

export interface IBloodPressure {
    systolic: number;
    diastolic: number;
}