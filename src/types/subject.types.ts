export interface Subject {
  Id: string
  SubjectName: string
}

export interface CreateSubjectData {
  SubjectName: string
}

export interface UpdateSubjectData {
  SubjectName: string
}

export interface SubjectResponse {
  Id: string
  SubjectName: string
}
