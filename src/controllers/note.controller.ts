import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { INoteService } from '../interfaces/note.service.interface.js';
import { createNoteSchema, updateNoteSchema } from '../dto/note.dto.js';
import { noContent, ok, parseBody, pathParam } from '../utils/http.js';

/** Controller: translates HTTP <-> service calls. No business logic here. */
export class NoteController {
  constructor(private readonly service: INoteService) {}

  create = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dto = parseBody(event, createNoteSchema);
    return ok(await this.service.create(dto), 201);
  };

  list = async (): Promise<APIGatewayProxyResult> => ok(await this.service.list());

  getById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> =>
    ok(await this.service.getById(pathParam(event, 'id')));

  update = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dto = parseBody(event, updateNoteSchema);
    return ok(await this.service.update(pathParam(event, 'id'), dto));
  };

  remove = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    await this.service.remove(pathParam(event, 'id'));
    return noContent();
  };
}
