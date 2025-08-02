import { IBloodPressure, IPatient, IEvaluation } from "./types";

function extract_blood_pressure_values(bpStr?: string): IBloodPressure | false {
    if (bpStr) {
        const match = bpStr.match(/(\d{2,3})\/(\d{2,3})/);
        if (match) {
            const systolic = +match[1];
            const diastolic = +match[2];
    
            return { systolic, diastolic };
        }
    }
    return false;
}

export function evaluate_blood_pressure_risk(
    patient: (IPatient & IEvaluation)
): void {
    const bp = extract_blood_pressure_values(patient.blood_pressure);
    if (bp) {
        if (bp.systolic >= 140 || bp.diastolic >= 90) {
            patient.riskScore += 3;
        } else if (bp.systolic >= 130 || bp.diastolic >= 80) {
            patient.riskScore += 2;
        } else if (bp.systolic >= 120) {
            patient.riskScore += 1;
        }
    }
}

export function evaluate_temperature_risk(
    patient: (IPatient & IEvaluation)
): void {
    if (patient.temperature) {
        if (patient.temperature >= 101.0) {
            patient.riskScore += 2;
        } else if (patient.temperature >= 99.6) {
            patient.riskScore += 1;
        }
    } else {
        patient.qualityIssues = true;
    }
}

export function evaluate_age_risk(
    patient: (IPatient & IEvaluation)
): void {
    if (patient.age) {
        if (patient.age > 65) {
            patient.riskScore += 2;
        } else if (patient.age >= 40) {
            patient.riskScore += 1;
        }
    } else {
        patient.qualityIssues = true;
    }
}

export function compile_high_risk_patients(
    patients: (IPatient & IEvaluation)[],
    highRiskPatients: string[],
    feverPatients: string[],
    dataQualityIssues: string[]
) {
    patients.map(patient => {
        if (patient.riskScore >= 4
            && patient.patient_id
        ) {
            highRiskPatients.push(patient.patient_id);
        }
        if (patient.temperature
            && patient.temperature >= 99.6
            && patient.patient_id
        ) {
            feverPatients.push(patient.patient_id);
        }
        if (patient.qualityIssues
            && patient.patient_id
        ) {
            dataQualityIssues.push(patient.patient_id);
        }
    });
}