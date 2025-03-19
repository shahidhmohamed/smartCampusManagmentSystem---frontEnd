import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IAttendence } from '../attendence.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../attendence.test-samples';

import { AttendenceService } from './attendence.service';

const requireRestSample: IAttendence = {
  ...sampleWithRequiredData,
};

describe('Attendence Service', () => {
  let service: AttendenceService;
  let httpMock: HttpTestingController;
  let expectedResult: IAttendence | IAttendence[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(AttendenceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find('ABC').subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Attendence', () => {
      const attendence = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(attendence).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Attendence', () => {
      const attendence = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(attendence).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Attendence', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Attendence', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Attendence', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a Attendence', () => {
      const queryObject: any = {
        page: 0,
        size: 20,
        query: '',
        sort: [],
      };
      service.search(queryObject).subscribe(() => expectedResult);

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      expect(expectedResult).toBe(null);
    });

    describe('addAttendenceToCollectionIfMissing', () => {
      it('should add a Attendence to an empty array', () => {
        const attendence: IAttendence = sampleWithRequiredData;
        expectedResult = service.addAttendenceToCollectionIfMissing([], attendence);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(attendence);
      });

      it('should not add a Attendence to an array that contains it', () => {
        const attendence: IAttendence = sampleWithRequiredData;
        const attendenceCollection: IAttendence[] = [
          {
            ...attendence,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addAttendenceToCollectionIfMissing(attendenceCollection, attendence);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Attendence to an array that doesn't contain it", () => {
        const attendence: IAttendence = sampleWithRequiredData;
        const attendenceCollection: IAttendence[] = [sampleWithPartialData];
        expectedResult = service.addAttendenceToCollectionIfMissing(attendenceCollection, attendence);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(attendence);
      });

      it('should add only unique Attendence to an array', () => {
        const attendenceArray: IAttendence[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const attendenceCollection: IAttendence[] = [sampleWithRequiredData];
        expectedResult = service.addAttendenceToCollectionIfMissing(attendenceCollection, ...attendenceArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const attendence: IAttendence = sampleWithRequiredData;
        const attendence2: IAttendence = sampleWithPartialData;
        expectedResult = service.addAttendenceToCollectionIfMissing([], attendence, attendence2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(attendence);
        expect(expectedResult).toContain(attendence2);
      });

      it('should accept null and undefined values', () => {
        const attendence: IAttendence = sampleWithRequiredData;
        expectedResult = service.addAttendenceToCollectionIfMissing([], null, attendence, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(attendence);
      });

      it('should return initial array if no Attendence is added', () => {
        const attendenceCollection: IAttendence[] = [sampleWithRequiredData];
        expectedResult = service.addAttendenceToCollectionIfMissing(attendenceCollection, undefined, null);
        expect(expectedResult).toEqual(attendenceCollection);
      });
    });

    describe('compareAttendence', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareAttendence(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 'b77fb128-be50-47af-ba71-8ae37eed997d' };
        const entity2 = null;

        const compareResult1 = service.compareAttendence(entity1, entity2);
        const compareResult2 = service.compareAttendence(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 'b77fb128-be50-47af-ba71-8ae37eed997d' };
        const entity2 = { id: '30dfb41b-929d-44da-8370-63d967128bad' };

        const compareResult1 = service.compareAttendence(entity1, entity2);
        const compareResult2 = service.compareAttendence(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 'b77fb128-be50-47af-ba71-8ae37eed997d' };
        const entity2 = { id: 'b77fb128-be50-47af-ba71-8ae37eed997d' };

        const compareResult1 = service.compareAttendence(entity1, entity2);
        const compareResult2 = service.compareAttendence(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
