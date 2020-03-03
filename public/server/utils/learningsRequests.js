function getLearnings(subId) {
	return XQuery("sql: \n\
		select \n\
			d.person_fullname, \n\
			d.person_subdivision_name, \n\
			d.structure, \n\
			d.person_position_name, \n\
			d.learning_name, \n\
			d.start_usage_date, \n\
			d.last_usage_date, \n\
			d.max_end_date, \n\
			d.percent_score, \n\
			d.[status], \n\
			case d.passing_require \n\
				when 'true' then 1 \n\
				else 0 \n\
			end passing_require \n\
		from ( \n\
			select \n\
				ls.person_fullname, \n\
				ls.person_subdivision_name, \n\
				cast(t.p.query(' \n\
					for $PD in  /collaborator/path_subs/path_sub \n\
					return \n\
						concat(data($PD/name[1]), \" / \") \n\
				') as varchar(max)) as structure, \n\
				ls.person_position_name, \n\
				ls.course_name learning_name, \n\
				ls.start_usage_date, \n\
				ls.last_usage_date, \n\
				ls.max_end_date, \n\
				case \n\
					when cs.max_score = 0 then null \n\
					else cast(ls.score as varchar) + '(' + cast(round((ls.score / cs.max_score) * 100, 0) as varchar) + '%)' \n\
				end percent_score, \n\
				cls.name [status], \n\
				r.p.query('custom_elem/name[text() = \"passing_require\"]/../value/text()').value('.', 'varchar(16)') passing_require \n\
			from learnings ls \n\
			inner join learning l on l.id = ls.id \n\
			inner join [common.learning_states] cls on cls.id = ls.state_id \n\
			inner join courses cs on cs.id = ls.course_id \n\
			inner join collaborator cr on cr.id = ls.person_id \n\
			inner join collaborators crs on crs.id = ls.person_id \n\
			cross apply cr.data.nodes('/collaborator/path_subs') as t(p) \n\
			outer apply l.data.nodes('/learning/custom_elems') as r(p)  \n\
			where \n\
				(t.p.exist('path_sub/id[(. cast as xs:string?) = \"" + subId + "\"]') = 1) \n\
				and crs.is_dismiss = 0 \n\
			union \n\
			select \n\
				als.person_fullname, \n\
				als.person_subdivision_name, \n\
				cast(t.p.query(' \n\
					for $PD in  /collaborator/path_subs/path_sub \n\
					return \n\
						concat(data($PD/name[1]), \" / \") \n\
				') as varchar(max)) as structure, \n\
				als.person_position_name, \n\
				als.course_name learning_name, \n\
				als.start_usage_date, \n\
				als.last_usage_date, \n\
				als.max_end_date, \n\
				case \n\
					when cs.max_score = 0 then null \n\
					else cast(als.score as varchar) + '(' + cast(round((als.score / cs.max_score) * 100, 0) as varchar) + '%)'  \n\
				end percent_score, \n\
				cls.name [status], \n\
				r.p.query('custom_elem/name[text() = \"passing_require\"]/../value/text()').value('.', 'varchar(16)') passing_require \n\
			from active_learnings als \n\
			inner join active_learning al on al.id = als.id \n\
			inner join [common.learning_states] cls on cls.id = als.state_id \n\
			inner join courses cs on cs.id = als.course_id \n\
			inner join collaborator cr on cr.id = als.person_id \n\
			inner join collaborators crs on crs.id = als.person_id \n\
			cross apply cr.data.nodes('/collaborator/path_subs') as t(p) \n\
			outer apply al.data.nodes('/active_learning/custom_elems') as r(p) \n\
			where \n\
				(t.p.exist('path_sub/id[(. cast as xs:string?) = \"" + subId + "\"]') = 1) \n\
				and crs.is_dismiss = 0 \n\
		) d \n\
	");
}

function getTestLearnings(subId) {
	return XQuery("sql: \n\
		select \n\
			d.person_fullname, \n\
			d.person_subdivision_name, \n\
			d.structure, \n\
			d.person_position_name, \n\
			d.learning_name, \n\
			d.start_usage_date, \n\
			d.last_usage_date, \n\
			d.max_end_date, \n\
			d.percent_score, \n\
			d.[status], \n\
			case d.passing_require \n\
				when 'true' then 1 \n\
				else 0 \n\
			end passing_require \n\
		from ( \n\
			select \n\
				ls.person_fullname, \n\
				ls.person_subdivision_name, \n\
				cast(t.p.query(' \n\
					for $PD in  /collaborator/path_subs/path_sub \n\
					return \n\
						concat(data($PD/name[1]), \" / \") \n\
				') as varchar(max)) as structure, \n\
				ls.person_position_name, \n\
				ls.assessment_name learning_name, \n\
				ls.start_usage_date, \n\
				ls.last_usage_date, \n\
				ls.max_end_date, \n\
				case \n\
					when cs.passing_score = 0 then null \n\
					else cast(ls.score as varchar) + '(' + cast(round((ls.score / cs.passing_score) * 100, 0) as varchar) + '%)' \n\
				end percent_score, \n\
				cls.name [status], \n\
				r.p.query('custom_elem/name[text() = \"passing_require\"]/../value/text()').value('.', 'varchar(16)') passing_require \n\
			from test_learnings ls \n\
			inner join test_learning l on l.id = ls.id \n\
			inner join [common.learning_states] cls on cls.id = ls.state_id \n\
			inner join assessments cs on cs.id = ls.assessment_id \n\
			inner join collaborator cr on cr.id = ls.person_id \n\
			inner join collaborators crs on crs.id = ls.person_id \n\
			cross apply cr.data.nodes('/collaborator/path_subs') as t(p) \n\
			outer apply l.data.nodes('/test_learning/custom_elems') as r(p) \n\
			where \n\
				(t.p.exist('path_sub/id[(. cast as xs:string?) = \"" + subId + "\"]') = 1) \n\
				and crs.is_dismiss = 0 \n\
			union \n\
			select \n\
				als.person_fullname, \n\
				als.person_subdivision_name, \n\
				cast(t.p.query(' \n\
					for $PD in  /collaborator/path_subs/path_sub \n\
					return \n\
						concat(data($PD/name[1]), \" / \") \n\
				') as varchar(max)) as structure, \n\
				als.person_position_name, \n\
				als.assessment_name learning_name, \n\
				als.start_usage_date, \n\
				als.last_usage_date, \n\
				als.max_end_date, \n\
				case \n\
					when cs.passing_score = 0 then null \n\
					else cast(als.score as varchar) + '(' + cast(round((als.score / cs.passing_score) * 100, 0) as varchar) + '%)'  \n\
				end percent_score, \n\
				cls.name [status], \n\
				r.p.query('custom_elem/name[text() = \"passing_require\"]/../value/text()').value('.', 'varchar(16)') passing_require \n\
			from active_test_learnings als \n\
			inner join active_test_learning al on al.id = als.id \n\
			inner join [common.learning_states] cls on cls.id = als.state_id \n\
			inner join assessments cs on cs.id = als.assessment_id \n\
			inner join collaborator cr on cr.id = als.person_id \n\
			inner join collaborators crs on crs.id = als.person_id \n\
			cross apply cr.data.nodes('/collaborator/path_subs') as t(p) \n\
			outer apply al.data.nodes('/active_test_learning/custom_elems') as r(p) \n\
			where \n\
				(t.p.exist('path_sub/id[(. cast as xs:string?) = \"" + subId + "\"]') = 1) \n\
				and crs.is_dismiss = 0 \n\
		) d \n\
	");
}