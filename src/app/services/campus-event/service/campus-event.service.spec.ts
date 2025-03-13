import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ICampusEvent } from '../campus-event.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../campus-event.test-samples';

import { CampusEventService, RestCampusEvent } from './campus-event.service';

const requireRestSample: RestCampusEvent = {
  ...sampleWithRequiredData,
  eventDate: sampleWithRequiredData.eventDate?.toJSON(),
};

describe('CampusEvent Service', () => {
  let service: CampusEventService;
  let httpMock: HttpTestingController;
  let expectedResult: ICampusEvent | ICampusEvent[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(CampusEventService);
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

    it('should create a CampusEvent', () => {
      const campusEvent = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(campusEvent).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a CampusEvent', () => {
      const campusEvent = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(campusEvent).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a CampusEvent', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of CampusEvent', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a CampusEvent', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a CampusEvent', () => {
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

    describe('addCampusEventToCollectionIfMissing', () => {
      it('should add a CampusEvent to an empty array', () => {
        const campusEvent: ICampusEvent = sampleWithRequiredData;
        expectedResult = service.addCampusEventToCollectionIfMissing([], campusEvent);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(campusEvent);
      });

      it('should not add a CampusEvent to an array that contains it', () => {
        const campusEvent: ICampusEvent = sampleWithRequiredData;
        const campusEventCollection: ICampusEvent[] = [
          {
            ...campusEvent,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addCampusEventToCollectionIfMissing(campusEventCollection, campusEvent);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a CampusEvent to an array that doesn't contain it", () => {
        const campusEvent: ICampusEvent = sampleWithRequiredData;
        const campusEventCollection: ICampusEvent[] = [sampleWithPartialData];
        expectedResult = service.addCampusEventToCollectionIfMissing(campusEventCollection, campusEvent);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(campusEvent);
      });

      it('should add only unique CampusEvent to an array', () => {
        const campusEventArray: ICampusEvent[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const campusEventCollection: ICampusEvent[] = [sampleWithRequiredData];
        expectedResult = service.addCampusEventToCollectionIfMissing(campusEventCollection, ...campusEventArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const campusEvent: ICampusEvent = sampleWithRequiredData;
        const campusEvent2: ICampusEvent = sampleWithPartialData;
        expectedResult = service.addCampusEventToCollectionIfMissing([], campusEvent, campusEvent2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(campusEvent);
        expect(expectedResult).toContain(campusEvent2);
      });

      it('should accept null and undefined values', () => {
        const campusEvent: ICampusEvent = sampleWithRequiredData;
        expectedResult = service.addCampusEventToCollectionIfMissing([], null, campusEvent, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(campusEvent);
      });

      it('should return initial array if no CampusEvent is added', () => {
        const campusEventCollection: ICampusEvent[] = [sampleWithRequiredData];
        expectedResult = service.addCampusEventToCollectionIfMissing(campusEventCollection, undefined, null);
        expect(expectedResult).toEqual(campusEventCollection);
      });
    });

    describe('compareCampusEvent', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareCampusEvent(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 'f86072de-cac8-4708-be49-02b7571657cf' };
        const entity2 = null;

        const compareResult1 = service.compareCampusEvent(entity1, entity2);
        const compareResult2 = service.compareCampusEvent(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 'f86072de-cac8-4708-be49-02b7571657cf' };
        const entity2 = { id: '882d3a75-0e6f-481b-a13a-6fc8ceec1003' };

        const compareResult1 = service.compareCampusEvent(entity1, entity2);
        const compareResult2 = service.compareCampusEvent(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 'f86072de-cac8-4708-be49-02b7571657cf' };
        const entity2 = { id: 'f86072de-cac8-4708-be49-02b7571657cf' };

        const compareResult1 = service.compareCampusEvent(entity1, entity2);
        const compareResult2 = service.compareCampusEvent(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
