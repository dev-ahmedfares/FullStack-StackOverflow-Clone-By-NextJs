"use client";

import { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { QuestionValidation } from "@/lib/validation";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { useState } from "react";
import { useTheme } from "@/context/ThemeProvider";

export default function Question({ type }: { type: string }) {
    const {mode} = useTheme()
  const [isSubmitting, setIsSubmitting] = useState();
  const editorRef = useRef(null);

  // 1. Define your form.
  const form = useForm<z.infer<typeof QuestionValidation>>({
    resolver: zodResolver(QuestionValidation),
    defaultValues: {
      title: "",
      explanation: "",
      tags: [],
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof QuestionValidation>) {
    console.log(values);
  }

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: any,
  ) => {
    if (e.key === "Enter" && field.name === "tags") {
      e.preventDefault();

      const tagInput = e.target as HTMLInputElement;
      const tagValue = tagInput.value.trim();

      if (tagValue !== "") {
        if (tagValue.length > 15) {
          return form.setError("tags", {
            type: "required",
            message: "Tag must be less than 15 characters",
          });
        }

        if (!field.value.includes(tagValue as never)) {
          form.setValue("tags", [...field.value, tagValue]);
          tagInput.value = "";
          form.clearErrors("tags");
        } else {
          form.trigger();
        }
      }
    }
  };

  const handleRemoveTags = (tag: string, field: any) => {
    const arrOfTags = field.value.filter((item: string) => item !== tag);
    form.setValue("tags", arrOfTags);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-10"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-dark400_light800 paragraph-semibold">
                Question Title <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="no-focus paragraph-regular light-border-2 background-light900_dark300 text-dark300_light700 min-h-[56px]"
                />
              </FormControl>
              <FormDescription className="body-regular text-light-500">
                Be specific and imagine you&apos;re asking a question to another
                person.
              </FormDescription>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="explanation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-dark400_light800 paragraph-semibold ">
                Detailed explanation of your problem{" "}
                <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl className="mt-3.5">
                <Editor
                apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                // TODO : Add On blur and and onEditedChange
                  onInit={(evt, editor) => (
                    // @ts-ignore
                    editorRef.current = editor)}
                  initialValue=""
                  init={{
                    height: 350,
                    menubar: false,
                    plugins: [
                      'advlist',
                      'autolink',
                      'lists',
                      'link',
                      'image',
                      'charmap',
                      'preview',
                      'anchor',
                      'searchreplace',
                      'visualblocks',
                      'codesample',
                      'fullscreen',
                      'insertdatetime',
                      'media',
                      'table'
                    ],
                    toolbar:
                      'undo redo |  ' +
                      'codesample | bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist ',
                    content_style: 'body { font-family:Inter; font-size:16px }',
                    skin: mode === 'dark' ? 'oxide-dark' : 'oxide',
                    content_css: mode === 'dark' ? 'dark' : 'light'
                  }}
                />
              </FormControl>
              <FormDescription className="body-regular text-light-500">
                Introduces the problem and expand on what you put in the title.
                Minimum 20 characters.
              </FormDescription>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        {/* TODO : to make it can to remove or add tags at edit */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-dark400_light800 paragraph-semibold">
                Tags <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <div>
                  <Input
                    onKeyDown={(e) => handleInputKeyDown(e, field)}
                    className="no-focus paragraph-regular light-border-2 background-light900_dark300 text-dark300_light700 min-h-[56px]"
                  />
                  {field.value.length > 0 && (
                    <div className="flex-start mt-2 gap-2.5">
                      {field.value.map((tag) => (
                        <Badge
                          key={tag}
                          className="background-light800_dark300 text-light400_light500 subtle-medium flex-center gap-2 px-4 py-2"
                        >
                          {tag}
                          {type !== "Edit" && (
                            <Image
                              className={
                                "cursor-pointer object-contain invert-0 dark:invert"
                              }
                              onClick={() => handleRemoveTags(tag, field)}
                              src={"/assets/icons/close.svg"}
                              alt="Close icon"
                              width={12}
                              height={12}
                            />
                          )}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription className="body-regular text-light-500">
                Add up to 3 tags to describe what your question is about. You
                need to press enter to add a tag.
              </FormDescription>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
         <Button
          type="submit"
          className="primary-gradient w-fit !text-light-900"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>{type === "Edit" ? "Editing..." : "Posting..."}</>
          ) : (
            <>{type === "Edit" ? "Edit Question" : "Ask a Question"}</>
          )}
        </Button><Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
