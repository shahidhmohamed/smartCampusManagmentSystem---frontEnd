import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IAttendenceStudentsRecord } from '../attendence-students-record.model';
import {
  sampleWithFullData,
  sampleWithNewData,
  sampleWithPartialData,
  sampleWithRequiredData,
} from '../attendence-students-record.test-samples';

import { AttendenceStudentsRecordService } from './attendence-students-record.service';

const requireRestSample: IAttendenceStudentsRecord = {
  ...sampleWithRequiredData,
};

describe('AttendenceStudentsRecord Service', () => {
  let service: AttendenceStudentsRecordService;
  let httpMock: HttpTestingController;
  let expectedResult: IAttendenceStudentsRecord | IAttendenceStudentsRecord[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(AttendenceStudentsRecordService);
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

    it('should create a AttendenceStudentsRecord', () => {
      const attendenceStudentsRecord = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(attendenceStudentsRecord).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a AttendenceStudentsRecord', () => {
      const attendenceStudentsRecord = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(attendenceStudentsRecord).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a AttendenceStudentsRecord', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of AttendenceStudentsRecord', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a AttendenceStudentsRecord', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a AttendenceStudentsRecord', () => {
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

    describe('addAttendenceStudentsRecordToCollectionIfMissing', () => {
      it('should add a AttendenceStudentsRecord to an empty array', () => {
        const attendenceStudentsRecord: IAttendenceStudentsRecord = sampleWithRequiredData;
        expectedResult = service.addAttendenceStudentsRecordToCollectionIfMissing([], attendenceStudentsRecord);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(attendenceStudentsRecord);
      });

      it('should not add a AttendenceStudentsRecord to an array that contains it', () => {
        const attendenceStudentsRecord: IAttendenceStudentsRecord = sampleWithRequiredData;
        const attendenceStudentsRecordCollection: IAttendenceStudentsRecord[] = [
          {
            ...attendenceStudentsRecord,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addAttendenceStudentsRecordToCollectionIfMissing(
          attendenceStudentsRecordCollection,
          attendenceStudentsRecord,
        );
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a AttendenceStudentsRecord to an array that doesn't contain it", () => {
        const attendenceStudentsRecord: IAttendenceStudentsRecord = sampleWithRequiredData;
        const attendenceStudentsRecordCollection: IAttendenceStudentsRecord[] = [sampleWithPartialData];
        expectedResult = service.addAttendenceStudentsRecordToCollectionIfMissing(
          attendenceStudentsRecordCollection,
          attendenceStudentsRecord,
        );
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(attendenceStudentsRecord);
      });

      it('should add only unique AttendenceStudentsRecord to an array', () => {
        const attendenceStudentsRecordArray: IAttendenceStudentsRecord[] = [
          sampleWithRequiredData,
          sampleWithPartialData,
          sampleWithFullData,
        ];
        const attendenceStudentsRecordCollection: IAttendenceStudentsRecord[] = [sampleWithRequiredData];
        expectedResult = service.addAttendenceStudentsRecordToCollectionIfMissing(
          attendenceStudentsRecordCollection,
          ...attendenceStudentsRecordArray,
        );
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const attendenceStudentsRecord: IAttendenceStudentsRecord = sampleWithRequiredData;
        const attendenceStudentsRecord2: IAttendenceStudentsRecord = sampleWithPartialData;
        expectedResult = service.addAttendenceStudentsRecordToCollectionIfMissing([], attendenceStudentsRecord, attendenceStudentsRecord2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(attendenceStudentsRecord);
        expect(expectedResult).toContain(attendenceStudentsRecord2);
      });

      it('should accept null and undefined values', () => {
        const attendenceStudentsRecord: IAttendenceStudentsRecord = sampleWithRequiredData;
        expectedResult = service.addAttendenceStudentsRecordToCollectionIfMissing([], null, attendenceStudentsRecord, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(attendenceStudentsRecord);
      });

      it('should return initial array if no AttendenceStudentsRecord is added', () => {
        const attendenceStudentsRecordCollection: IAttendenceStudentsRecord[] = [sampleWithRequiredData];
        expectedResult = service.addAttendenceStudentsRecordToCollectionIfMissing(attendenceStudentsRecordCollection, undefined, null);
        expect(expectedResult).toEqual(attendenceStudentsRecordCollection);
      });
    });

    describe('compareAttendenceStudentsRecord', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareAttendenceStudentsRecord(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: '5e4b80ab-1d73-4b99-8c68-ea343bde6562' };
        const entity2 = null;

        const compareResult1 = service.compareAttendenceStudentsRecord(entity1, entity2);
        const compareResult2 = service.compareAttendenceStudentsRecord(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: '5e4b80ab-1d73-4b99-8c68-ea343bde6562' };
        const entity2 = { id: 'a11d264b-8670-4b44-8771-7b26bfb290d9' };

        const compareResult1 = service.compareAttendenceStudentsRecord(entity1, entity2);
        const compareResult2 = service.compareAttendenceStudentsRecord(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: '5e4b80ab-1d73-4b99-8c68-ea343bde6562' };
        const entity2 = { id: '5e4b80ab-1d73-4b99-8c68-ea343bde6562' };

        const compareResult1 = service.compareAttendenceStudentsRecord(entity1, entity2);
        const compareResult2 = service.compareAttendenceStudentsRecord(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
