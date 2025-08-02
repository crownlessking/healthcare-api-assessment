import axios from 'axios';
import {
    IPatient,
    IEvaluation,
    THasNext,
    TResponse
} from './types';
import {
    compile_high_risk_patients,
    evaluate_age_risk,
    evaluate_blood_pressure_risk,
    evaluate_temperature_risk
} from './risk.scoring';

const BASE_URL = 'https://assessment.ksensetech.com/api';

const some_time = async (seconds = 5) => await new Promise(
    resolve => setTimeout(resolve, seconds * 1000)
);

async function fetch_and_evaluate_patients_data() {
    let response: TResponse,
        taskNotCompleted: THasNext = true,
        page = 1;
    const high_risk_patients: string[] = [],
        fever_patients: string[] = [],
        data_quality_issues: string[] = [],
        limit = 5;

    while (taskNotCompleted) {
        try {
            process.stdout.write(`Attempting to make a request for page ${page} in 5 seconds... `);
            await some_time();

            response = await axios.get(
                `${BASE_URL}/patients?page=${page}&limit=${limit}`,
                {
                    headers: {
                        'x-api-key': 'ak_0ab9d4c7d41584c831b845615d8182918bc5f5804a73e91f'
                    }
                }
            );
    
            if (response) {
                const rawData: IPatient[] | undefined = response.data?.data;
                if (rawData) {
                    const patients = rawData.map(rawPatientData => {
                        const patient: IPatient & IEvaluation = {
                            ...rawPatientData,
                            riskScore: 0,
                            bloodPressureRisk: false,
                            ageRisk: false,
                            qualityIssues: false,
                            systolic: -1,
                            diastolic: -1,
                        };
                        evaluate_blood_pressure_risk(patient);
                        evaluate_temperature_risk(patient);
                        evaluate_age_risk(patient);
                        return patient;
                    });
        
                    compile_high_risk_patients(
                        patients,
                        high_risk_patients,
                        fever_patients,
                        data_quality_issues
                    );
                }
                taskNotCompleted = response?.data?.pagination?.hasNext;
                taskNotCompleted && page++;
            }
            console.log('Success.');
        } catch (e) {
            console.log('Failed!');
            if (axios.isAxiosError(e)) {
                console.log(`HTTP STATUS ${e.response?.status}. Retrying in 20 seconds... `);
                await some_time(15);
            } else {
                console.log(e);
                console.log('APP CRASHED!');
                break;
            }
        }
    }

    console.log('\n\nResults:\n\n');
    console.log('High-Risk Patients', high_risk_patients);
    console.log('Fever Patients', fever_patients);
    console.log('Data Quality Issues', data_quality_issues);

    try {
        process.stdout.write('\n\nSubmitting assessment... ');
    
        const response = await axios.post(`${BASE_URL}/submit-assessment`, {
            high_risk_patients,
            fever_patients,
            data_quality_issues
        }, {
            headers: {
                'x-api-key': 'ak_0ab9d4c7d41584c831b845615d8182918bc5f5804a73e91f'
            }
        });

        console.log('Success. Result:\n\n\n', response);
    } catch (e) {
        console.log('Failed! That\'s not good.');
        if (axios.isAxiosError(e)) {
            console.log(`HTTP STATUS ${e.response?.status}.`);
        } else {
            console.log(e);
        }
    }
}

fetch_and_evaluate_patients_data();