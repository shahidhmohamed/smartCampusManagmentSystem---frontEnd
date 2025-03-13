import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IResourceBooking } from '../resource-booking.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../resource-booking.test-samples';

import { ResourceBookingService, RestResourceBooking } from './resource-booking.service';

const requireRestSample: RestResourceBooking = {
  ...sampleWithRequiredData,
  startTime: sampleWithRequiredData.startTime?.toJSON(),
  endTime: sampleWithRequiredData.endTime?.toJSON(),
};

describe('ResourceBooking Service', () => {
  let service: ResourceBookingService;
  let httpMock: HttpTestingController;
  let expectedResult: IResourceBooking | IResourceBooking[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ResourceBookingService);
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

    it('should create a ResourceBooking', () => {
      const resourceBooking = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(resourceBooking).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ResourceBooking', () => {
      const resourceBooking = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(resourceBooking).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ResourceBooking', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ResourceBooking', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ResourceBooking', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a ResourceBooking', () => {
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

    describe('addResourceBookingToCollectionIfMissing', () => {
      it('should add a ResourceBooking to an empty array', () => {
        const resourceBooking: IResourceBooking = sampleWithRequiredData;
        expectedResult = service.addResourceBookingToCollectionIfMissing([], resourceBooking);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(resourceBooking);
      });

      it('should not add a ResourceBooking to an array that contains it', () => {
        const resourceBooking: IResourceBooking = sampleWithRequiredData;
        const resourceBookingCollection: IResourceBooking[] = [
          {
            ...resourceBooking,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addResourceBookingToCollectionIfMissing(resourceBookingCollection, resourceBooking);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ResourceBooking to an array that doesn't contain it", () => {
        const resourceBooking: IResourceBooking = sampleWithRequiredData;
        const resourceBookingCollection: IResourceBooking[] = [sampleWithPartialData];
        expectedResult = service.addResourceBookingToCollectionIfMissing(resourceBookingCollection, resourceBooking);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(resourceBooking);
      });

      it('should add only unique ResourceBooking to an array', () => {
        const resourceBookingArray: IResourceBooking[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const resourceBookingCollection: IResourceBooking[] = [sampleWithRequiredData];
        expectedResult = service.addResourceBookingToCollectionIfMissing(resourceBookingCollection, ...resourceBookingArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const resourceBooking: IResourceBooking = sampleWithRequiredData;
        const resourceBooking2: IResourceBooking = sampleWithPartialData;
        expectedResult = service.addResourceBookingToCollectionIfMissing([], resourceBooking, resourceBooking2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(resourceBooking);
        expect(expectedResult).toContain(resourceBooking2);
      });

      it('should accept null and undefined values', () => {
        const resourceBooking: IResourceBooking = sampleWithRequiredData;
        expectedResult = service.addResourceBookingToCollectionIfMissing([], null, resourceBooking, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(resourceBooking);
      });

      it('should return initial array if no ResourceBooking is added', () => {
        const resourceBookingCollection: IResourceBooking[] = [sampleWithRequiredData];
        expectedResult = service.addResourceBookingToCollectionIfMissing(resourceBookingCollection, undefined, null);
        expect(expectedResult).toEqual(resourceBookingCollection);
      });
    });

    describe('compareResourceBooking', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareResourceBooking(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 'a0fde613-22b6-44c4-b803-2fbe442477c2' };
        const entity2 = null;

        const compareResult1 = service.compareResourceBooking(entity1, entity2);
        const compareResult2 = service.compareResourceBooking(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 'a0fde613-22b6-44c4-b803-2fbe442477c2' };
        const entity2 = { id: '1fb84424-c8fd-486a-91b9-84fa89437ecf' };

        const compareResult1 = service.compareResourceBooking(entity1, entity2);
        const compareResult2 = service.compareResourceBooking(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 'a0fde613-22b6-44c4-b803-2fbe442477c2' };
        const entity2 = { id: 'a0fde613-22b6-44c4-b803-2fbe442477c2' };

        const compareResult1 = service.compareResourceBooking(entity1, entity2);
        const compareResult2 = service.compareResourceBooking(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
