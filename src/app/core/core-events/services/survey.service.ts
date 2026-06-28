import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  private apiUrl = `${environment.apiUrl}/api/events`;

  constructor(private http: HttpClient) {}

  getPendingSurveys(eventId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${eventId}/surveys/pending`,
      { withCredentials: true }
    );
  }

  getSurveyDetail(eventId: number, surveyId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${eventId}/surveys/${surveyId}`,
      { withCredentials: true }
    );
  }

  submitResponse(eventId: number, surveyId: number, body: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${eventId}/surveys/${surveyId}/responses`,
      body,
      { withCredentials: true }
    );
  }
}
